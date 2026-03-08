/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्राणां गणितं मूर्ध्नि वर्तते"
 *
 * As the crest of a peacock, as the gem on the hood
 * of a cobra — so stands mathematics at the crown
 * of all knowledge.
 *                                       — Brahmagupta
 *                                         628 CE · Brahmasphutasiddhanta
 *
 * Creator:   Jawahar R. Mallah
 * Email:     jawahar@aitdl.com
 * GitHub:    https://github.com/jawahar-mallah
 * Websites:  https://ganitsutram.com
 *            https://aitdl.com
 *
 * Then:  628 CE · Brahmasphutasiddhanta
 * Now:   8 March MMXXVI · Vikram Samvat 2082
 *
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 *
 * Developer Note:
 * If you intend to reuse this code, please respect
 * the creator and the work behind it.
 */
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

describe('Progress API Tests', () => {
    let testUserEmail = `test_qa_prog_${crypto.randomBytes(4).toString('hex')}@ganitsutram.com`;
    let authToken = '';

    it('Setup: Create user and login', async () => {
        await api('POST', '/api/auth/register', { email: testUserEmail, password: 'StrongPassword123!', role: 'student' });
        const res = await api('POST', '/api/auth/login', { email: testUserEmail, password: 'StrongPassword123!' });
        authToken = res.data.token;
    });

    it('All routes without auth -> 401', async () => {
        let res = await api('GET', '/api/user-progress');
        expect(res.status).toBe(401);

        res = await api('GET', '/api/user-progress/stats');
        expect(res.status).toBe(401);

        res = await api('POST', '/api/user-progress', { operation: 'digital-root', result: '8' });
        expect(res.status).toBe(401);

        res = await api('DELETE', '/api/user-progress');
        expect(res.status).toBe(401);
    });

    it('POST /api/user-progress (with auth) -> 201', async () => {
        const payload = {
            operation: 'digital-root',
            input: '98',
            result: '8',
            steps: '[98,17,8]'
        };
        const res = await api('POST', '/api/user-progress', payload, authToken);
        expect(res.status).toBe(201);
    });

    it('GET /api/user-progress (with auth) -> 200', async () => {
        const res = await api('GET', '/api/user-progress', null, authToken);
        expect(res.status).toBe(200);
        expect(res.data.entries.length).toBeGreaterThan(0);
        expect(res.data.entries[0].operation).toBe('digital-root');
    });

    it('GET /api/user-progress/stats (with auth) -> 200', async () => {
        const res = await api('GET', '/api/user-progress/stats', null, authToken);
        expect(res.status).toBe(200);
        expect(res.data.stats).toBeTruthy();
        expect(res.data.stats.totalSolved).toBeGreaterThan(0);
    });

    it('DELETE /api/user-progress (with auth) -> 200', async () => {
        const res = await api('DELETE', '/api/user-progress', null, authToken);
        expect(res.status).toBe(200);

        // Ensure it's deleted
        const check = await api('GET', '/api/user-progress', null, authToken);
        expect(check.data.entries.length).toBe(0);
    });

    it('Clean up test user', async () => {
        db.prepare('DELETE FROM users WHERE email = ?').run(testUserEmail);
    });
});
