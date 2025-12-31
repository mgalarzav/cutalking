const http = require('http');

function makeRequest(method, path, token, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function listUsers() {
    try {
        // Login as Admin
        const loginRes = await makeRequest('POST', '/api/login', null, { username: 'admin', password: 'admin123' });
        const token = JSON.parse(loginRes.body).token;

        if (!token) {
            console.error('Login failed.');
            return;
        }

        // Get Users
        const getUsersRes = await makeRequest('GET', '/api/users', token);
        const users = JSON.parse(getUsersRes.body);

        console.log('Current Users:');
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Username: ${u.username}, Role: ${u.role}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

listUsers();
