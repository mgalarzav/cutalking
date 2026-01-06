const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL y SUPABASE_KEY deben estar en el archivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createJoseUser() {
    try {
        const username = 'jose';
        const password = 'jose135';

        console.log(`Generando hash para el usuario ${username}...`);
        const passwordHash = await bcrypt.hash(password, 10);

        console.log('Insertando usuario en Supabase...');
        const { data, error } = await supabase
            .from('users')
            .upsert({
                username: username,
                password_hash: passwordHash,
                role: 'user',
                stars: 0
            }, { onConflict: 'username' })
            .select();

        if (error) {
            throw error;
        }

        console.log('¡Éxito! Usuario creado o actualizado correctamente.');
        console.log('-----------------------------------');
        console.log(`Usuario: ${username}`);
        console.log(`Clave: ${password}`);
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Error al crear el usuario:', error.message);
    }
}

createJoseUser();
