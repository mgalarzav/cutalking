const db = require('./server/db');
const bcrypt = require('bcrypt');

async function resetPassword() {
    try {
        const username = 'jose';
        const password = 'password123';
        const hash = await bcrypt.hash(password, 10);

        console.log(`Resetting password for user: ${username}`);

        await db.execute('UPDATE users SET password_hash = ? WHERE username = ?', [hash, username]);

        console.log('Password reset successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetPassword();
