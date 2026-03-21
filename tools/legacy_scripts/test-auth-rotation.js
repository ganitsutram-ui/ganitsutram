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
async function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSessions() {
    console.log("=== Refresh Token Rotation & Session Testing Suite ===");

    // 1. Issue dual tokens on login
    let tokens = await login("student@ganitsutram.com", "Password1!");
    if (!tokens.token || !tokens.refreshToken) {
        console.error("[FAIL] Did not receive dual tokens");
        return;
    }
    console.log(`[PASS] Login issued both tokens. Refresh: ${tokens.refreshToken.substring(0, 10)}...`);

    // 2. Refresh cycle
    console.log("\nAttempting proactive rotation...");
    let refreshed = await refresh(tokens.refreshToken);
    if (!refreshed.token || !refreshed.refreshToken) {
        console.error("[FAIL] Rotation did not yield new tokens.");
        return;
    }
    console.log(`[PASS] Refresh successful. New Refresh Hash: ${refreshed.refreshToken.substring(0, 10)}...`);

    // 3. Reuse attempt (malicious clone protection)
    console.log("\nSimulating reused token (from before first refresh)...");
    const hijacked = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken })
    });

    if (hijacked.status === 401) {
        console.log(`[PASS] Stale token correctly rejected. System protected against reuse.`);
    } else {
        console.error("[FAIL] Allowed use of stale token!");
    }

    // Since the line above triggered the Reuse protocol, the CURRENT session (refreshed) should now be totally revoked
    console.log("\nVerifying catastrophic cascade revocation...");
    const profile = await fetch('http://localhost:3000/api/auth/sessions', {
        headers: {
            'Authorization': `Bearer ${refreshed.token}`
        }
    });

    // Get the length of the list. Should be empty or throw unauth if the whole user context was blocked, but the cascade specifically revokes the *refresh* sessions.  
    // We can test by trying to use the latest, "valid" refresh token.
    const tryingNewest = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshed.refreshToken })
    });

    if (tryingNewest.status === 401) {
        console.log(`[PASS] Cascade revocation successful! The entire family line was terminated.`);
    } else {
        console.error("[FAIL] Cascade revocation failed. Valid tokens survived the exploit cascade.");
    }
}

async function register(email, password) {
    const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'student' })
    });
    // Ignore fail if already exists
}

async function login(email, password) {
    await register(email, password); // Ensure they exist

    const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) console.error("Login failed:", res.status, data);
    return data;
}

async function refresh(rt) {
    const res = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt })
    });
    const data = await res.json();
    if (!res.ok) console.error("Refresh failed:", res.status, data);
    return data;
}

testSessions().catch(console.error);
