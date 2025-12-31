const db = require('./server/db');

async function addExpiresAtColumn() {
    try {
        console.log('Adding expires_at column to users table...');

        // Check if column exists first to avoid errors
        const [columns] = await db.execute("SHOW COLUMNS FROM users LIKE 'expires_at'");

        if (columns.length === 0) {
            await db.execute('ALTER TABLE users ADD COLUMN expires_at DATE DEFAULT NULL AFTER role');
            console.log('Column expires_at added successfully.');
        } else {
            console.log('Column expires_at already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Failed to add column:', error);
        process.exit(1);
    }
}

addExpiresAtColumn();
