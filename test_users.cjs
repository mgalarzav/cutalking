const http = require('http');

// Helper to make requests
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

async function testUserManagement() {
    try {
        // 1. Login as Admin
        console.log('Logging in...');
        const loginRes = await makeRequest('POST', '/api/login', null, { username: 'admin', password: 'admin123' });
        const token = JSON.parse(loginRes.body).token;
        console.log('Login Status:', loginRes.statusCode);

        if (!token) {
            console.error('Login failed, cannot proceed.');
            return;
        }

        // 2. Get Users
        console.log('Fetching users...');
        const getUsersRes = await makeRequest('GET', '/api/users', token);
        console.log('Get Users Status:', getUsersRes.statusCode);
        console.log('Users:', getUsersRes.body);

        // 3. Create User
        console.log('Creating new user...');
        const createUserRes = await makeRequest('POST', '/api/users', token, { username: 'newuser', password: 'password123', role: 'user' });
        console.log('Create User Status:', createUserRes.statusCode);

        // 4. Get Users Again
        const getUsersRes2 = await makeRequest('GET', '/api/users', token);
        console.log('Users after creation:', getUsersRes2.body);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testUserManagement();
