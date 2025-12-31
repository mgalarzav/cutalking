const db = require('./db');

async function checkUser() {
    try {
        const [users] = await db.execute('SELECT id, username, stars FROM users WHERE username = "jose"');
        console.log('User jose:', users);

        if (users.length > 0) {
            const userId = users[0].id;
            const [progress] = await db.execute('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
            console.log('Progress for jose:', progress);

            // Calculate expected stars
            const completedCount = progress.filter(p => p.progress === 100).length;
            const expectedStars = completedCount * 10;
            console.log('Calculated expected stars:', expectedStars);

            if (users[0].stars !== expectedStars) {
                console.log('Mismatch detected! Fixing...');
                await db.execute('UPDATE users SET stars = ? WHERE id = ?', [expectedStars, userId]);
                console.log('Fixed stars for jose to:', expectedStars);
            } else {
                console.log('Stars are correct.');
            }
        }
    } catch (err) {
        console.error(err);
    }
    process.exit();
}

checkUser();
