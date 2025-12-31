const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cutalking_db',
    multipleStatements: true
});

const promisePool = pool.promise();

async function migrate() {
    try {
        console.log('Starting migration for user_progress table...');

        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id INT NOT NULL,
        scenario_id VARCHAR(50) NOT NULL,
        progress INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, scenario_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

        await promisePool.query(createTableQuery);
        console.log('user_progress table created or already exists.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
