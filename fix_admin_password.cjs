const db = require('./server/db');
const bcrypt = require('bcrypt');

async function fixAdminPassword() {
    try {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        console.log(`Updating admin password to hash of '${password}'...`);

        await db.execute('UPDATE users SET password_hash = ? WHERE username = ?', [hash, 'admin']);

        console.log("Admin password updated successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Failed to update password:", error);
        process.exit(1);
    }
}

fixAdminPassword();
