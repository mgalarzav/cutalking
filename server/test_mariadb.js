const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function testMariaDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cutalking_db'
        });

        console.log('Connected to MariaDB');
        const [rows] = await connection.execute('SELECT * FROM users');
        console.log('Users in MariaDB:', rows);
        await connection.end();
    } catch (error) {
        console.error('Error connecting to MariaDB:', error);
    }
}

testMariaDB();
