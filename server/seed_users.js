const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
    try {
        console.log('Seeding users...');

        const users = [
            { username: 'Alex_Pro', stars: 1250, role: 'user' },
            { username: 'Sarah_Coder', stars: 980, role: 'user' },
            { username: 'Mike_Dev', stars: 750, role: 'user' },
            { username: 'Emma_JS', stars: 620, role: 'user' },
            { username: 'David_Web', stars: 450, role: 'user' },
            { username: 'Lisa_Design', stars: 300, role: 'user' },
            { username: 'Tom_React', stars: 150, role: 'user' }
        ];

        const passwordHash = await bcrypt.hash('password123', 10);

        for (const user of users) {
            // Check if user exists
            const [rows] = await db.execute('SELECT id FROM users WHERE username = ?', [user.username]);
            if (rows.length === 0) {
                await db.execute(
                    'INSERT INTO users (username, password_hash, role, stars) VALUES (?, ?, ?, ?)',
                    [user.username, passwordHash, user.role, user.stars]
                );
                console.log(`Created user: ${user.username}`);
            } else {
                console.log(`User ${user.username} already exists. Updating stars...`);
                await db.execute('UPDATE users SET stars = ? WHERE username = ?', [user.stars, user.username]);
            }
        }

        console.log('Seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
