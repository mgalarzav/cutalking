const db = require('./db');
const bcrypt = require('bcrypt');

async function resetPassword() {
    try {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        console.log('Generated hash:', hash);

        const [result] = await db.execute(
            'UPDATE users SET password_hash = ? WHERE username = ?',
            [hash, 'admin']
        );

        if (result.affectedRows === 0) {
            console.log('Admin user not found, creating it...');
            await db.execute(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                ['admin', hash, 'admin']
            );
        }

        console.log('Admin password reset successfully to: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
}

resetPassword();
