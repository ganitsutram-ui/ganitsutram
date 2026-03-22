/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

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

describe('Solve API Tests', () => {
    let testUserEmail = `test_qa_solve_${crypto.randomBytes(4).toString('hex')}@ganitsutram.com`;
    let authToken = '';

    it('Setup: Create user and login', async () => {
        await api('POST', '/api/auth/register', { email: testUserEmail, password: 'StrongPassword123!', role: 'student' });
        const res = await api('POST', '/api/auth/login', { email: testUserEmail, password: 'StrongPassword123!' });
        authToken = res.data.token;
    });

    it('All operations return correct results', async () => {
        let res = await api('POST', '/api/solve', { operation: 'digital-root', input: 98 });
        expect(res.data.result).toBe(8);

        res = await api('POST', '/api/solve', { operation: 'digital-root-steps', input: 98 });
        expect(res.data.steps).toEqual([98, 17, 8]);

        res = await api('POST', '/api/solve', { operation: 'squares-ending-5', input: 75 });
        expect(res.data.result).toBe(5625);

        res = await api('POST', '/api/solve', { operation: 'multiply-by-11', input: 57 });
        expect(res.data.result).toBe(627);

        res = await api('POST', '/api/solve', { operation: 'nikhilam', inputA: 98, inputB: 97 });
        expect(res.data.result).toBe(9506);

        res = await api('POST', '/api/solve', { operation: 'urdhva', inputA: 12, inputB: 13 });
        expect(res.data.result).toBe(156);

        res = await api('POST', '/api/solve', { operation: 'kaprekar', input: 3087 });
        expect(res.data.result.constant).toBe(6174);

        const res6 = await api('POST', '/api/solve', { operation: 'fibonacci', input: 8 });
        expect(res6.data.result.sequence).toEqual([1, 1, 2, 3, 5, 8, 13, 21]);

        res = await api('POST', '/api/solve', { operation: 'square-pattern', input: 9 });
        expect(res.data.result.rootPattern).toEqual([1, 4, 9, 7, 7, 9, 4, 1, 9]);

        res = await api('POST', '/api/solve', { operation: 'analyse-sequence', input: "2,4,6,8,10" });
        expect(res.data.result.isArithmeticProgression).toBeTruthy();
    });

    it('Validation errors', async () => {
        let res = await api('POST', '/api/solve', { operation: 'unknown' });
        expect(res.status).toBe(400);

        res = await api('POST', '/api/solve', { operation: 'digital-root', input: 1e16 });
        expect(res.status).toBe(422);

        res = await api('POST', '/api/solve', { operation: 'digital-root', input: -5 });
        expect(res.status).toBe(422);

        res = await api('POST', '/api/solve', { operation: 'squares-ending-5', input: 76 });
        expect(res.status).toBe(422);

        res = await api('POST', '/api/solve', { operation: 'kaprekar', input: 99999 });
        expect(res.status).toBe(422);
    });

    it('Every response has attribution field', async () => {
        const res = await api('POST', '/api/solve', { operation: 'digital-root', input: 15 });
        expect(res.data.attribution).toBeTruthy();
    });

    it('Auto-save (with auth token)', async () => {
        await api('POST', '/api/solve', { operation: 'nikhilam', inputA: 8, inputB: 9 }, authToken);
        const res = await api('GET', '/api/user-progress', null, authToken);
        expect(res.status).toBe(200);
        expect(res.data.entries.length).toBeGreaterThan(0);
        expect(res.data.entries[0].operation).toBe('nikhilam');
    });

    it('Clean up QA user', async () => {
        db.prepare('DELETE FROM users WHERE email = ?').run(testUserEmail);
    });
});
