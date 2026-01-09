const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const path = require('path');
const multer = require('multer');

app.use(cors());
app.use(express.json());

// Configure Multer for file upload
// Configure Multer for file upload (using memory storage for Supabase)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
};

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const { data: user, error } = await db
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.expires_at) {
            const expirationDate = new Date(user.expires_at);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            if (now > expirationDate) {
                return res.status(403).json({ message: 'Account expired' });
            }
        }

        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({
            token: accessToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                stars: user.stars || 0,
                profile_picture: user.profile_picture
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Protected Route Example (Admin only)
app.get('/api/admin', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ message: 'Welcome Admin', user: req.user });
});

// Get all users (Admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { data, error } = await db
            .from('users')
            .select('id, username, role, expires_at, created_at');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Create user (Admin only)
app.post('/api/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { username, password, role, expires_at } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

    try {
        const hash = await bcrypt.hash(password, 10);
        const { error } = await db
            .from('users')
            .insert([{
                username,
                password_hash: hash,
                role: role || 'user',
                expires_at: expires_at || null
            }]);

        if (error) {
            if (error.code === '23505') { // Postgres unique violation
                return res.status(400).json({ message: 'Username already exists' });
            }
            throw error;
        }
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Update user (Admin or Self)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;

    if (req.user.role !== 'admin' && req.user.id != userId) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { username, password, role, expires_at, profile_picture } = req.body;

    let targetRole = role;
    if (req.user.role !== 'admin') {
        targetRole = req.user.role;
    }

    try {
        const updateData = {};

        if (username) updateData.username = username;
        if (targetRole) updateData.role = targetRole;
        if (expires_at !== undefined) updateData.expires_at = expires_at;
        if (profile_picture) updateData.profile_picture = profile_picture;

        if (password) {
            updateData.password_hash = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const { error } = await db
            .from('users')
            .update(updateData)
            .eq('id', userId);

        if (error) throw error;
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { error } = await db
            .from('users')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Update user stats (Authenticated)
app.put('/api/users/:id/stats', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    const { stars } = req.body;

    if (req.user.id != userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const { error } = await db
            .from('users')
            .update({ stars })
            .eq('id', userId);

        if (error) throw error;
        res.json({ message: 'Stats updated', stars });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating stats' });
    }
});

// Sync user stars based on progress (Authenticated)
app.post('/api/users/:id/sync-stars', authenticateToken, async (req, res) => {
    const userId = req.params.id;

    if (req.user.id != userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const { count, error: countError } = await db
            .from('user_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('progress', 100);

        if (countError) throw countError;

        const newStars = count * 1;

        const { error: updateError } = await db
            .from('users')
            .update({ stars: newStars })
            .eq('id', userId);

        if (updateError) throw updateError;

        res.json({ message: 'Stars synced', stars: newStars });
    } catch (error) {
        console.error('Error syncing stars:', error);
        res.status(500).json({ message: 'Error syncing stars' });
    }
});

// Upload Endpoint
app.post('/api/upload', (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Max size is 1MB.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;

            // Upload to Supabase Storage bucket 'fotos'
            const { data, error } = await db.storage
                .from('fotos')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (error) {
                console.error('Supabase storage error:', error);
                return res.status(500).json({ message: 'Error uploading to Supabase Storage' });
            }

            // Get public URL
            const { data: { publicUrl } } = db.storage
                .from('fotos')
                .getPublicUrl(fileName);

            res.json({ imageUrl: publicUrl });
        } catch (error) {
            console.error('Upload process error:', error);
            res.status(500).json({ message: 'Internal server error during upload' });
        }
    });
});

// Get leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await db
            .from('users')
            .select('id, username, stars, role, profile_picture')
            .order('stars', { ascending: false })
            .limit(10);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});

// Get user progress
app.get('/api/progress', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await db
            .from('user_progress')
            .select('scenario_id, progress')
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress' });
    }
});

// Update user progress
app.post('/api/progress', authenticateToken, async (req, res) => {
    const { scenario_id, progress } = req.body;

    if (!scenario_id || progress === undefined) {
        return res.status(400).json({ message: 'Scenario ID and progress are required' });
    }

    try {
        const { error } = await db
            .from('user_progress')
            .upsert({
                user_id: req.user.id,
                scenario_id,
                progress
            }, { onConflict: 'user_id, scenario_id' });

        if (error) throw error;
        res.json({ message: 'Progress updated' });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: 'Error updating progress' });
    }
});

// Reset user progress
app.delete('/api/progress', authenticateToken, async (req, res) => {
    try {
        const { error } = await db
            .from('user_progress')
            .delete()
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ message: 'Progress reset successfully' });
    } catch (error) {
        console.error('Error resetting progress:', error);
        res.status(500).json({ message: 'Error resetting progress' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
