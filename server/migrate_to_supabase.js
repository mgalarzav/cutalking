const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// MariaDB Configuration
const mysqlConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cutalking_db'
};

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    let mysqlConn;
    try {
        console.log('Connecting to MariaDB...');
        mysqlConn = await mysql.createConnection(mysqlConfig);
        console.log('Connected to MariaDB.');

        // 1. Migrate Users
        console.log('Fetching users from MariaDB...');
        const [users] = await mysqlConn.execute('SELECT * FROM users');
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            console.log(`Migrating user: ${user.username}...`);
            const { error } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    username: user.username,
                    password_hash: user.password_hash,
                    role: user.role,
                    created_at: user.created_at
                }, { onConflict: 'username' });

            if (error) {
                console.error(`Error migrating user ${user.username}:`, error.message);
            }
        }

        // 2. Migrate User Progress
        console.log('Fetching user progress from MariaDB...');
        // Check if user_progress table exists in MariaDB
        try {
            const [progress] = await mysqlConn.execute('SELECT * FROM user_progress');
            console.log(`Found ${progress.length} progress records.`);

            for (const record of progress) {
                console.log(`Migrating progress for user_id ${record.user_id}, scenario ${record.scenario_id}...`);
                const { error } = await supabase
                    .from('user_progress')
                    .upsert({
                        user_id: record.user_id,
                        scenario_id: record.scenario_id,
                        progress: record.progress,
                        updated_at: record.last_updated || record.updated_at
                    }, { onConflict: 'user_id, scenario_id' });

                if (error) {
                    console.error(`Error migrating progress for user ${record.user_id}:`, error.message);
                }
            }
        } catch (err) {
            console.warn('user_progress table not found in MariaDB or error fetching it:', err.message);
        }

        console.log('Migration finished!');

        // Suggestion: Reset sequences in Supabase if needed
        console.log('\nIMPORTANT: If you migrated IDs manually, you might need to reset Postgres sequences in Supabase SQL Editor:');
        console.log("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));");
        console.log("SELECT setval('user_progress_id_seq', (SELECT MAX(id) FROM user_progress));");

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (mysqlConn) await mysqlConn.end();
    }
}

migrate();
