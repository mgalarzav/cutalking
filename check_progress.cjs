const db = require('./server/db');

async function checkProgress() {
    try {
        const username = 'jose';
        console.log(`Checking data for user: ${username}`);

        // Get User ID
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            console.log('User not found!');
            process.exit(1);
        }
        const user = users[0];
        console.log('User found:', user);

        // Get Progress
        const [progress] = await db.execute('SELECT * FROM user_progress WHERE user_id = ?', [user.id]);
        console.log('User Progress:', progress);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkProgress();
