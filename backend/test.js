async function runTests() {
    console.log('1. Registering user...');
    let res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test-reset@ganitsutram.com', password: 'Password123!', role: 'student' })
    });
    console.log(res.status, await res.json());

    console.log('2. Requesting forgot-password (unknown)...');
    res = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'unknown@ganitsutram.com' })
    });
    console.log(res.status, await res.json());

    console.log('3. Requesting forgot-password (known)...');
    res = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test-reset@ganitsutram.com' })
    });
    console.log(res.status, await res.json());
}

runTests();
