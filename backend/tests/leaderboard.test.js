/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Integration tests for Leaderboard and Gamification.
 */

const crypto = require('crypto');

async function api(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(`http://localhost:3000${path}`, options);
        let data;
        try {
            data = await res.json();
        } catch (e) {
            data = null;
        }
        return { status: res.status, data };
    } catch (err) {
        return { status: 500, error: err.message };
    }
}

describe('Leaderboard & Gamification Tests', () => {
    let testUserEmail = `lb_test_${crypto.randomBytes(4).toString('hex')}@ganitsutram.com`;
    let testUserPassword = 'StrongPassword123!';
    let authToken = '';

    it('Setup: Register and Login test user', async () => {
        const reg = await api('POST', '/api/auth/register', {
            email: testUserEmail,
            password: testUserPassword,
            role: 'student'
        });
        expect(reg.status).toBe(201);

        const login = await api('POST', '/api/auth/login', {
            email: testUserEmail,
            password: testUserPassword
        });
        expect(login.status).toBe(200);
        authToken = login.data.token;
    });

    it('GET /api/leaderboard -> 200', async () => {
        const res = await api('GET', '/api/leaderboard');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.leaderboard)).toBeTruthy();
    });

    it('GET /api/leaderboard/badges -> 200', async () => {
        const res = await api('GET', '/api/leaderboard/badges');
        expect(res.status).toBe(200);
        expect(res.data.badges.length).toBeGreaterThanOrEqual(20);
    });

    it('Points accumulation via Solve API', async () => {
        // Initial state
        let me = await api('GET', '/api/leaderboard/me', null, authToken);
        const startPoints = me.data.rank.totalPoints;

        // Perform solve
        await api('POST', '/api/solve', {
            operation: 'digital-root',
            input: 999
        }, authToken);

        // Wait for async point award
        await new Promise(r => setTimeout(r, 600));

        me = await api('GET', '/api/leaderboard/me', null, authToken);
        expect(me.data.rank.totalPoints).toBeGreaterThan(startPoints);

        const hasBonus = me.data.pointHistory.some(h => h.reason === 'first_solve_bonus');
        expect(hasBonus).toBeTruthy();
    });

    it('Points accumulation via Practice API', async () => {
        let me = await api('GET', '/api/leaderboard/me', null, authToken);
        const startPoints = me.data.rank.totalPoints;

        // Practice check
        await api('POST', '/api/practice/check', {
            questionId: crypto.randomUUID ? crypto.randomUUID() : 'test-q-123',
            operation: 'multiply-by-11',
            question: '11 * 11',
            difficulty: 'beginner',
            userAnswer: 121,
            correctAnswer: 121,
            timeTakenMs: 1000
        }, authToken);

        await new Promise(r => setTimeout(r, 600));

        me = await api('GET', '/api/leaderboard/me', null, authToken);
        expect(me.data.rank.totalPoints).toBeGreaterThan(startPoints);

        const hasFastBonus = me.data.pointHistory.some(h => h.reason === 'practice_correct_fast');
        expect(hasFastBonus).toBeTruthy();
    });

    it('Display Name update -> 200', async () => {
        const newName = "VedicMaster " + crypto.randomBytes(2).toString('hex');
        const res = await api('POST', '/api/leaderboard/display-name', { displayName: newName }, authToken);
        expect(res.status).toBe(200);
        expect(res.data.displayName).toBe(newName);

        // Verify public access
        const lb = await api('GET', '/api/leaderboard');
        const found = lb.data.leaderboard.find(p => p.displayName === newName);
        expect(found).toBeTruthy();
    });

    it('Badge Logic - Earn First Solve Badge', async () => {
        const me = await api('GET', '/api/leaderboard/me', null, authToken);
        const hasBadge = me.data.badges.some(b => b.id === 'first-solve');
        expect(hasBadge).toBeTruthy();
    });

    it('Cleanup test user', async () => {
        const db = require('../database/db');
        db.prepare('DELETE FROM users WHERE email = ?').run(testUserEmail);
        // Also clean up points/badges so next run is fresh (though we use random email)
    });
});
