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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

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

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

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
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.expires_at) {
            const expirationDate = new Date(user.expires_at);
            const now = new Date();
            // Reset time part to compare dates only
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
        const [rows] = await db.execute('SELECT id, username, role, expires_at, created_at FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Create user (Admin only)
app.post('/api/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

    try {
        const hash = await bcrypt.hash(password, 10);
        await db.execute('INSERT INTO users (username, password_hash, role, expires_at) VALUES (?, ?, ?, ?)', [username, hash, role || 'user', req.body.expires_at || null]);
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Update user (Admin or Self)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;

    // Allow if admin or if updating own profile
    if (req.user.role !== 'admin' && req.user.id != userId) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { username, password, role } = req.body;

    // Prevent non-admins from changing their role
    let targetRole = role;
    if (req.user.role !== 'admin') {
        targetRole = req.user.role;
    }

    try {
        let query = 'UPDATE users SET username = ?, role = ?, expires_at = ?';
        let params = [username, targetRole, req.body.expires_at || null];

        if (req.body.profile_picture) {
            query += ', profile_picture = ?';
            params.push(req.body.profile_picture);
        }

        if (password) {
            const hash = await bcrypt.hash(password, 10);
            query += ', password_hash = ?';
            params.push(hash);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        await db.execute(query, params);
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Update user stats (Authenticated)
app.put('/api/users/:id/stats', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    const { stars } = req.body;

    // Ensure user can only update their own stats unless admin
    if (req.user.id != userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        await db.execute('UPDATE users SET stars = ? WHERE id = ?', [stars, userId]);
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
        // Calculate stars based on completed scenarios
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND progress = 100', [userId]);
        const completedCount = rows[0].count;
        const newStars = completedCount * 1; // 1 star per completed dialogue

        // Update user stars
        await db.execute('UPDATE users SET stars = ? WHERE id = ?', [newStars, userId]);

        res.json({ message: 'Stars synced', stars: newStars });
    } catch (error) {
        console.error('Error syncing stars:', error);
        res.status(500).json({ message: 'Error syncing stars' });
    }
});

// Upload Endpoint
app.post('/api/upload', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Max size is 1MB.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ message: err.message });
        }

        // Everything went fine.
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
        res.json({ imageUrl });
    });
});

// Get leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, username, stars, role, profile_picture FROM users ORDER BY stars DESC LIMIT 10');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});

// Get user progress
app.get('/api/progress', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT scenario_id, progress FROM user_progress WHERE user_id = ?', [req.user.id]);
        res.json(rows);
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
        await db.execute(
            'INSERT INTO user_progress (user_id, scenario_id, progress) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE progress = ?',
            [req.user.id, scenario_id, progress, progress]
        );
        res.json({ message: 'Progress updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating progress' });
    }
});

// Reset user progress
app.delete('/api/progress', authenticateToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM user_progress WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Progress reset successfully' });
    } catch (error) {
        console.error('Error resetting progress:', error);
        res.status(500).json({ message: 'Error resetting progress' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
