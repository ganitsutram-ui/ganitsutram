const crypto = require('crypto');

async function api(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`http://localhost:3000${path}`, options);
    let data;
    try {
        data = await res.json();
    } catch (e) {
        data = null;
    }
    return { status: res.status, data };
}

describe('Auth API Tests', () => {
    let testUserEmail = `test_qa_${crypto.randomBytes(4).toString('hex')}@ganitsutram.com`;
    let testUserPassword = 'StrongPassword123!';
    let authToken = '';
    let refreshToken = '';
    let sessionId = '';

    it('Register new user -> 201', async () => {
        const { status, data } = await api('POST', '/api/auth/register', {
            email: testUserEmail,
            password: testUserPassword,
            role: 'student'
        });
        expect(status).toBe(201);
        expect(data.user.email).toBe(testUserEmail);
        expect(data.token).toBeTruthy();
        expect(data.refreshToken).toBeTruthy();
    });

    it('Register same email again -> 409', async () => {
        const { status } = await api('POST', '/api/auth/register', {
            email: testUserEmail,
            password: testUserPassword,
            role: 'student'
        });
        expect(status).toBe(409);
    });

    it('Register with weak password -> 422', async () => {
        const { status } = await api('POST', '/api/auth/register', {
            email: `weak_${testUserEmail}`,
            password: '123',
            role: 'student'
        });
        expect(status).toBe(422);
    });

    it('Register with invalid role -> 422', async () => {
        const { status } = await api('POST', '/api/auth/register', {
            email: `role_${testUserEmail}`,
            password: testUserPassword,
            role: 'hacker'
        });
        expect(status).toBe(422);
    });

    it('Register with invalid email -> 422', async () => {
        const { status } = await api('POST', '/api/auth/register', {
            email: `notanemail`,
            password: testUserPassword,
            role: 'student'
        });
        expect(status).toBe(422);
    });

    it('Login with correct credentials -> 200', async () => {
        const { status, data } = await api('POST', '/api/auth/login', {
            email: testUserEmail,
            password: testUserPassword
        });
        expect(status).toBe(200);
        expect(data.token).toBeTruthy();
        expect(data.refreshToken).toBeTruthy();
        authToken = data.token;
        refreshToken = data.refreshToken;
    });

    it('Login with wrong password -> 401', async () => {
        const { status } = await api('POST', '/api/auth/login', {
            email: testUserEmail,
            password: 'WrongPassword123!'
        });
        expect(status).toBe(401);
    });

    it('Login with unknown email -> 404', async () => {
        const { status } = await api('POST', '/api/auth/login', {
            email: 'unknown@ganitsutram.com',
            password: testUserPassword
        });
        expect(status).toBe(404);
    });

    it('GET /api/auth/me with valid token -> 200', async () => {
        const { status, data } = await api('GET', '/api/auth/me', null, authToken);
        expect(status).toBe(200);
        expect(data.user.email).toBe(testUserEmail);
    });

    it('GET /api/auth/me with no token -> 401', async () => {
        const { status } = await api('GET', '/api/auth/me');
        expect(status).toBe(401);
    });

    it('GET /api/auth/me with expired token -> 401', async () => {
        const { status } = await api('GET', '/api/auth/me', null, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTYxNjQxOTIwMCwiZXhwIjoxNjE2NDIwMTAwfQ.signature');
        expect(status).toBe(401);
    });

    it('POST /api/auth/refresh with valid refreshToken -> 200', async () => {
        const { status, data } = await api('POST', '/api/auth/refresh', {
            refreshToken
        });
        expect(status).toBe(200);
        expect(data.token).toBeTruthy();
        expect(data.refreshToken).toBeTruthy();

        const oldRefreshToken = refreshToken;
        authToken = data.token;
        refreshToken = data.refreshToken;

        const reuseResult = await api('POST', '/api/auth/refresh', {
            refreshToken: oldRefreshToken
        });
        expect(reuseResult.status).toBe(401);
    });

    it('GET /api/auth/sessions -> 200', async () => {
        const { status, data } = await api('GET', '/api/auth/sessions', null, authToken);
        expect(status).toBe(200);
        expect(data.sessions.length).toBeGreaterThan(0);
        sessionId = data.sessions[0].sessionId;
    });

    it('DELETE /api/auth/sessions/:id -> 200', async () => {
        const { status } = await api('DELETE', `/api/auth/sessions/${sessionId}`, null, authToken);
        expect(status).toBe(200);
    });

    it('Revoked session refresh rejected -> 401', async () => {
        const { status } = await api('POST', '/api/auth/refresh', {
            refreshToken
        });
        expect(status).toBe(401);
    });

    it('POST /api/auth/logout -> 200', async () => {
        // First login
        const loginRes = await api('POST', '/api/auth/login', {
            email: testUserEmail,
            password: testUserPassword
        });
        const authToken = loginRes.data.token;
        const refreshToken = loginRes.data.refreshToken;

        const { status } = await api('POST', '/api/auth/logout', { refreshToken }, authToken);
        expect(status).toBe(200);

        const refreshRes = await api('POST', '/api/auth/refresh', {
            refreshToken
        });
        expect(refreshRes.status).toBe(401);
    });

    it('POST /api/auth/forgot-password (known email) -> 200', async () => {
        const { status } = await api('POST', '/api/auth/forgot-password', { email: testUserEmail });
        expect(status).toBe(200);
    });

    it('POST /api/auth/forgot-password (unknown email) -> 200 (no leak)', async () => {
        const { status } = await api('POST', '/api/auth/forgot-password', { email: 'unknown@ganitsutram.com' });
        expect(status).toBe(200);
    });

    it('POST /api/auth/reset-password (invalid token) -> 400', async () => {
        const { status } = await api('POST', '/api/auth/reset-password', { token: 'invalid', newPassword: 'NewPassword123!' });
        expect(status).toBe(400); // Wait, depending on implementation it might be 400 or 401. I'll expect 400.
    });

    it('Clean up test user', async () => {
        // Find existing DB module
        const db = require('../database/db');
        db.prepare('DELETE FROM users WHERE email = ?').run(testUserEmail);
    });
});
