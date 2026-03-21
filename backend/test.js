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
 */

async function runTests() {
    const BASE_URL = 'http://localhost:3000';
    
    console.log('--- GANITSUTRAM INTEGRATION TEST ---');
    
    // 0. Health Check
    console.log('0. Checking health...');
    try {
        let hRes = await fetch(`${BASE_URL}/api/health`);
        console.log('Health:', hRes.status, await hRes.json());
    } catch (e) {
        console.error('Health check failed. Is the server running?');
        return;
    }

    // 1. Registering user
    console.log('1. Registering user...');
    try {
        let res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: `test-${Date.now()}@ganitsutram.com`, 
                password: 'Password123!', 
                role: 'student' 
            })
        });
        console.log('Register Status:', res.status);
        const data = await res.json();
        console.log('Register Data:', data);
    } catch (e) {
        console.error('Register failed:', e.message);
    }

    // 2. Forgot password
    console.log('2. Requesting forgot-password...');
    try {
        let res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'unknown@ganitsutram.com' })
        });
        console.log('Forgot-Password Status:', res.status, await res.json());
    } catch (e) {
        console.error('Forgot-password failed:', e.message);
    }

    console.log('--- TESTS COMPLETED ---');
}

runTests();
