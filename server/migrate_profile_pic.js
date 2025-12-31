const db = require('./db');
const dotenv = require('dotenv');

dotenv.config();

async function migrate() {
    try {
        console.log('Starting migration...');

        // Check if column exists
        const [columns] = await db.execute("SHOW COLUMNS FROM users LIKE 'profile_picture'");

        if (columns.length === 0) {
            await db.execute("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL");
            console.log("Added 'profile_picture' column to 'users' table.");
        } else {
            console.log("'profile_picture' column already exists.");
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
