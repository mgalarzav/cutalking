import fetch from 'node-fetch';

async function testApi() {
    try {
        console.log('1. Logging in...');
        // Try Alex_Pro
        const loginRes = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Alex_Pro',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token:', token ? 'Received' : 'Missing');

        console.log('2. Fetching Leaderboard...');
        const leaderboardRes = await fetch('http://localhost:3001/api/leaderboard', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!leaderboardRes.ok) {
            throw new Error(`Leaderboard fetch failed: ${leaderboardRes.statusText}`);
        }

        const leaderboardData = await leaderboardRes.json();
        console.log('Leaderboard data length:', leaderboardData.length);
        console.log('First user:', leaderboardData[0]);

    } catch (error) {
        console.error('API Test Failed:', error.message);
    }
}

testApi();
