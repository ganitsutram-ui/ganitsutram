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

describe('Practice API Tests', () => {
    let testUserEmail = `test_qa_practice_${crypto.randomBytes(4).toString('hex')}@ganitsutram.com`;
    let authToken = '';

    it('Setup: Create user and login', async () => {
        await api('POST', '/api/auth/register', { email: testUserEmail, password: 'StrongPassword123!', role: 'student' });
        const res = await api('POST', '/api/auth/login', { email: testUserEmail, password: 'StrongPassword123!' });
        authToken = res.data.token;
    });

    it('GET /api/practice -> 200, questions without answers', async () => {
        const res = await api('GET', '/api/practice');
        expect(res.status).toBe(200);
        expect(res.data.questions.length).toBeGreaterThan(0);
        expect(res.data.questions[0].answer).toBeFalsy(); // Server shouldn't send answers
    });

    it('POST /api/practice/check (correct) -> isCorrect true', async () => {
        const payload = {
            questionId: '550e8400-e29b-41d4-a716-446655440000',
            operation: 'digital-root',
            question: '98',
            userAnswer: '8',
            correctAnswer: '8',
            difficulty: 'beginner',
            timeTakenMs: 1200
        };
        const res = await api('POST', '/api/practice/check', payload, authToken);
        expect(res.status).toBe(200);
        expect(res.data.isCorrect).toBeTruthy();
    });

    it('POST /api/practice/check (wrong) -> isCorrect false', async () => {
        const payload = {
            questionId: '550e8400-e29b-41d4-a716-446655440001',
            operation: 'digital-root',
            question: '98',
            userAnswer: '7',
            correctAnswer: '8',
            difficulty: 'beginner',
            timeTakenMs: 1500
        };
        const res = await api('POST', '/api/practice/check', payload, authToken);
        expect(res.status).toBe(200);
        expect(res.data.isCorrect).toBeFalsy();
    });

    it('GET /api/practice/stats (no auth) -> 401', async () => {
        const res = await api('GET', '/api/practice/stats');
        expect(res.status).toBe(401);
    });

    it('GET /api/practice/stats (with auth) -> 200', async () => {
        const res = await api('GET', '/api/practice/stats', null, authToken);
        expect(res.status).toBe(200);
        expect(res.data.totalAttempts).toBeGreaterThan(0); // Because we made 2 check calls
    });

    it('Clean up test user', async () => {
        // Delete user
        try {
            db.prepare('DELETE FROM users WHERE email = ?').run(testUserEmail);
        } catch (e) { }
    });
});
