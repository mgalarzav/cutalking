const db = require('./db');

async function migrate() {
    try {
        console.log('Running migration: Add stars column to users table...');
        await db.execute('ALTER TABLE users ADD COLUMN stars INT DEFAULT 0');
        console.log('Migration successful!');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column stars already exists. Skipping.');
            process.exit(0);
        } else {
            console.error('Migration failed:', error);
            process.exit(1);
        }
    }
}

migrate();
