const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function exportData() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cutalking_db'
        });

        console.log('--- EXPORTANDO DATOS DE MARIADB ---');

        // Exportar Usuarios
        const [users] = await connection.execute('SELECT * FROM users');
        let sql = '-- Exportación de Usuarios\n';
        users.forEach(user => {
            const expiresAt = user.expires_at ? `'${new Date(user.expires_at).toISOString()}'` : 'NULL';
            const createdAt = user.created_at ? `'${new Date(user.created_at).toISOString()}'` : 'CURRENT_TIMESTAMP';
            const profilePic = user.profile_picture ? `'${user.profile_picture}'` : 'NULL';

            sql += `INSERT INTO users (id, username, password_hash, role, stars, profile_picture, expires_at, created_at) \n`;
            sql += `VALUES (${user.id}, '${user.username}', '${user.password_hash}', '${user.role}', ${user.stars || 0}, ${profilePic}, ${expiresAt}, ${createdAt}) \n`;
            sql += `ON CONFLICT (username) DO UPDATE SET \n`;
            sql += `  password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, stars = EXCLUDED.stars, \n`;
            sql += `  profile_picture = EXCLUDED.profile_picture, expires_at = EXCLUDED.expires_at;\n\n`;
        });

        // Exportar Progreso
        try {
            const [progress] = await connection.execute('SELECT * FROM user_progress');
            sql += '-- Exportación de Progreso\n';
            progress.forEach(p => {
                const updatedAt = (p.last_updated || p.updated_at) ? `'${new Date(p.last_updated || p.updated_at).toISOString()}'` : 'CURRENT_TIMESTAMP';
                sql += `INSERT INTO user_progress (user_id, scenario_id, progress, updated_at) \n`;
                sql += `VALUES (${p.user_id}, '${p.scenario_id}', ${p.progress}, ${updatedAt}) \n`;
                sql += `ON CONFLICT (user_id, scenario_id) DO UPDATE SET progress = EXCLUDED.progress, updated_at = EXCLUDED.updated_at;\n\n`;
            });
        } catch (e) {
            console.log('Nota: No se encontró la tabla user_progress o está vacía.');
        }

        // Resetear secuencias
        sql += `-- Resetear secuencias de IDs\n`;
        sql += `SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));\n`;
        sql += `SELECT setval('user_progress_id_seq', (SELECT MAX(id) FROM user_progress));\n`;

        fs.writeFileSync('supabase_data_export.sql', sql);
        console.log('¡Éxito! El archivo "supabase_data_export.sql" ha sido generado.');
        console.log('Puedes copiar su contenido y pegarlo en el SQL Editor de Supabase.');

    } catch (error) {
        console.error('Error al exportar:', error.message);
        console.log('\nCONSEJO: Asegúrate de que MariaDB esté corriendo y los datos en el .env sean correctos.');
    } finally {
        if (connection) await connection.end();
    }
}

exportData();
