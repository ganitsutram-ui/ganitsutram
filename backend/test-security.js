const dns = require('dns');

async function testSecurity() {
    console.log('\n--- 1. XSS Sanitisation Test ---');
    const xssRes = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '<script>alert(1)</script>bad@x.com', password: "Password1!", role: "student" })
    });
    const xssData = await xssRes.json();
    console.log(`Status: ${xssRes.status}`);
    console.log(`Response:`, xssData);
    if (xssRes.status === 422 && xssData.error === "Invalid email format") {
        console.log('[PASS] XSS tag neutralised/rejected');
    }

    console.log('\n--- 2. Body Size Test (10kb Limit) ---');
    const largeBody = { operation: 'digital-root', input: 12345, padding: "X".repeat(15000) }; // > 10kb
    const sizeRes = await fetch('http://localhost:3000/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeBody)
    });
    console.log(`Status: ${sizeRes.status}`);
    if (sizeRes.status === 413) {
        console.log('[PASS] Payload Too Large (413) correctly triggered');
    }

    console.log('\n--- 3. Input Size Guard Test ---');
    const guardRes = await fetch('http://localhost:3000/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'digital-root', input: 99999999999999999 })
    });
    const guardData = await guardRes.json();
    console.log(`Status: ${guardRes.status}`);
    console.log(`Response:`, guardData);
    if (guardRes.status === 422 && guardData.error.includes("too large")) {
        console.log('[PASS] Massive input securely rejected');
    }

    console.log('\n--- 4. Security Headers Test ---');
    const headRes = await fetch('http://localhost:3000/api/health');
    const headers = headRes.headers;
    const poweredBy = headers.get('x-powered-by');
    const frameOpt = headers.get('x-frame-options');
    const sniffOpt = headers.get('x-content-type-options');
    console.log('X-Powered-By:', poweredBy);
    console.log('X-Frame-Options:', frameOpt);
    console.log('X-Content-Type-Options:', sniffOpt);

    if (poweredBy === null && frameOpt === 'SAMEORIGIN' && sniffOpt === 'nosniff') {
        console.log('[PASS] Security Headers match specification');
    }

    console.log('\n--- 5. Rate Limiting Test (Auth Limiter) ---');
    let rateLimitPassed = false;
    for (let i = 1; i <= 22; i++) {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `test${i}@test.com`, password: "Password1!" })
        });
        if (i > 20 && res.status === 429) {
            console.log(`[PASS] Request ${i} correctly blocked with 429 Too Many Requests`);
            rateLimitPassed = true;
            break;
        }
    }
    if (!rateLimitPassed) console.log('[FAIL] Rate limit did not trigger');
}

testSecurity().catch(console.error);
