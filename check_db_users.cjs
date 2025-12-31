const db = require('./server/db');

async function checkDatabase() {
    try {
        console.log("Attempting to connect to database...");
        const [rows] = await db.execute('SELECT id, username, password_hash, role FROM users');
        console.log("Connection successful!");
        console.log("---------------------------------------------------");
        console.log("Users found in database:");
        rows.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Username: ${user.username}`);
            console.log(`Role: ${user.role}`);
            console.log(`Password Hash: ${user.password_hash.substring(0, 20)}...`); // Show partial hash
            console.log("---------------------------------------------------");
        });
        process.exit(0);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

checkDatabase();
