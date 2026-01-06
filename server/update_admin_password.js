const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAdminPassword() {
    const username = 'admin';
    const newPassword = 'CUAdmin135+';

    try {
        console.log(`Updating password for user: ${username}...`);
        const hash = await bcrypt.hash(newPassword, 10);

        const { data, error } = await supabase
            .from('users')
            .update({ password_hash: hash })
            .eq('username', username);

        if (error) {
            throw error;
        }

        console.log('Admin password updated successfully!');
    } catch (error) {
        console.error('Error updating admin password:', error.message);
    } finally {
        process.exit();
    }
}

updateAdminPassword();
