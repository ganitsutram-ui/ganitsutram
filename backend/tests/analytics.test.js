const crypto = require('crypto');
const db = require('../database/db');

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

describe('Analytics API Tests', () => {
    let adminEmail = `test_qa_analyt_adm_${crypto.randomBytes(4).toString('hex')}@ganitsutram.com`;
    let studentEmail = `test_qa_analyt_stu_${crypto.randomBytes(4).toString('hex')}@ganitsutram.com`;
    let adminToken = '';
    let studentToken = '';

    it('Setup: Create users and login', async () => {
        await api('POST', '/api/auth/register', { email: adminEmail, password: 'StrongPassword123!', role: 'admin' });
        const adminLogin = await api('POST', '/api/auth/login', { email: adminEmail, password: 'StrongPassword123!' });
        adminToken = adminLogin.data.token;

        await api('POST', '/api/auth/register', { email: studentEmail, password: 'StrongPassword123!', role: 'student' });
        const stuLogin = await api('POST', '/api/auth/login', { email: studentEmail, password: 'StrongPassword123!' });
        studentToken = stuLogin.data.token;
    });

    it('POST /api/analytics/beacon (page_view) -> 200', async () => {
        const payload = {
            eventType: 'page_view',
            metadata: { path: '/solver', domain: 'solve.ganitsutram.com' }
        };
        const res = await api('POST', '/api/analytics/beacon', payload);
        expect(res.status).toBe(200);
    });

    it('POST /api/analytics/beacon (solve) -> 400 (invalid type)', async () => {
        const payload = {
            eventType: 'solve', // invalid for beacon, backend expects solve via /api/solve only
            metadata: { op: 'digital-root' }
        };
        const res = await api('POST', '/api/analytics/beacon', payload);
        expect(res.status).toBe(400); // or 422 depending on implementation
    });

    it('GET /api/analytics/dashboard (admin) -> 200', async () => {
        const res = await api('GET', '/api/analytics/dashboard', null, adminToken);
        expect(res.status).toBe(200);
    });

    it('GET /api/analytics/realtime (admin) -> 200', async () => {
        const res = await api('GET', '/api/analytics/realtime', null, adminToken);
        expect(res.status).toBe(200);
    });

    it('GET /api/analytics/dashboard (student) -> 403', async () => {
        const res = await api('GET', '/api/analytics/dashboard', null, studentToken);
        expect(res.status).toBe(403);
    });

    it('Clean up test users', async () => {
        db.prepare('DELETE FROM users WHERE email IN (?, ?)').run(adminEmail, studentEmail);
    });
});
