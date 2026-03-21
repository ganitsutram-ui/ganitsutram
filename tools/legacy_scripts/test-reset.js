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
const db = require('./database/db');

async function testReset() {
    const user = db.prepare("SELECT user_id FROM users WHERE email = 'test-reset@ganitsutram.com'").get();
    if (!user) return console.log('User not found');

    const rawToken = 'my-test-token-123';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60000).toISOString();

    db.prepare(`
        INSERT INTO reset_tokens (token_id, user_id, token_hash, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
    `).run('test-uuid-123', user.user_id, tokenHash, expiresAt, new Date().toISOString());

    console.log('Inserted known token hash. Testing reset endpoint...');

    let res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: rawToken, newPassword: 'NewPassword321!' })
    });
    console.log(res.status, await res.json());

    console.log('Testing login with new password...');
    res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test-reset@ganitsutram.com', password: 'NewPassword321!' })
    });
    const loginData = await res.json();
    console.log(res.status, loginData.token ? 'Success' : loginData);

    console.log('Testing reset with reused token...');
    res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: rawToken, newPassword: 'AnotherPassword123!' })
    });
    console.log(res.status, await res.json());

    const rawExpiredToken = 'expired-token-123';
    const expiredHash = crypto.createHash('sha256').update(rawExpiredToken).digest('hex');
    db.prepare(`
        INSERT INTO reset_tokens (token_id, user_id, token_hash, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
    `).run('test-uuid-expired', user.user_id, expiredHash, new Date(Date.now() - 30 * 60000).toISOString(), new Date().toISOString());

    console.log('Testing expired token...');
    res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: rawExpiredToken, newPassword: 'AnotherPassword123!' })
    });
    console.log(res.status, await res.json());
}
testReset();
