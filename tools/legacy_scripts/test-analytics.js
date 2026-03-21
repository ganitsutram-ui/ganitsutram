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

async function run() {
    console.log("=== Analytics Validation Suite ===");

    // 1. BEACON TEST (NO AUTH)
    console.log("\n[Test 1] Firing Anonymous 'page_view' Beacon...");
    let bRes = await fetch('http://localhost:3000/api/analytics/beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'page_view', metadata: { page: 'Test Runner' } })
    });
    if (bRes.ok) console.log("[PASS] Anonymous Beacon accepted (200 OK)");
    else console.error("[FAIL] Beacon rejected:", bRes.status);

    // 2. INVALID BEACON REJECTION
    console.log("\n[Test 2] Firing Invalid Beacon Event...");
    let iRes = await fetch('http://localhost:3000/api/analytics/beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'auth_login' })
    });
    if (iRes.status === 400) console.log("[PASS] Invalid beacon correctly rejected.");
    else console.error("[FAIL] Invalid beacon bypass:", iRes.status);

    // 3. ADMIN LOGIN
    console.log("\n[Test 3] Authenticating as Admin...");
    let loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'netmax7@gmail.com', password: 'Password1!' }) // This is an admin in the seed
    });

    // If netmax7@gmail.com isn't admin or doesn't exist, we register it
    if (!loginRes.ok) {
        await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'netmax7@gmail.com', password: 'Password1!', role: 'admin' })
        });
        loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'netmax7@gmail.com', password: 'Password1!' })
        });
    }

    let authData = await loginRes.json();
    let token = authData.token;
    if (!token) {
        console.error("[FAIL] Admin login failed.");
        return;
    }

    // 4. FETCH DASHBOARD
    console.log("\n[Test 4] Fetching Admin Dashboard payload...");
    let dashRes = await fetch('http://localhost:3000/api/analytics/dashboard?days=7', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (dashRes.ok) {
        let dash = await dashRes.json();
        console.log(`[PASS] Dashboard pulled. Found ${dash.dashboard.summary.totalUsers} users.`);
    } else {
        console.error("[FAIL] Dashboard blocked:", dashRes.status);
    }

    // 5. FETCH NON-ADMIN (FORBIDDEN)
    console.log("\n[Test 5] Fetching Admin Dashboard with Student Token...");
    let studentLogin = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@ganitsutram.com', password: 'Password1!' })
    });
    let studentToken = (await studentLogin.json()).token;

    let fRes = await fetch('http://localhost:3000/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    if (fRes.status === 403) console.log("[PASS] Student correctly forbidden.");
    else console.error("[FAIL] Role leakage detected:", fRes.status);

    console.log("\nValidation Suite Complete.");
}

run().catch(console.error);
