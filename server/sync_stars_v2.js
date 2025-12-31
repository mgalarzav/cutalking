const db = require('./db');

async function syncAllUsers() {
    try {
        const [users] = await db.execute('SELECT id, username FROM users');
        console.log(`Syncing stars for ${users.length} users...`);

        for (const user of users) {
            const [progress] = await db.execute('SELECT * FROM user_progress WHERE user_id = ? AND progress = 100', [user.id]);
            const completedCount = progress.length;
            const newStars = completedCount * 1; // 1 star per dialogue

            await db.execute('UPDATE users SET stars = ? WHERE id = ?', [newStars, user.id]);
            console.log(`Synced ${user.username}: ${completedCount} dialogues -> ${newStars} stars`);
        }
        console.log('Sync complete.');
    } catch (err) {
        console.error(err);
    }
    process.exit();
}

syncAllUsers();
