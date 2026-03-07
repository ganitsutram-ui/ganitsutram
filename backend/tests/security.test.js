const crypto = require('crypto');

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
    return { status: res.status, data, headers: res.headers };
}

describe('Security API Tests', () => {
    let testUserEmail = `test_qa_sec_${crypto.randomBytes(4).toString('hex')}@ganitsutram.com`;

    it('XSS sanitisation on POST /api/auth/register -> 422', async () => {
        const res = await api('POST', '/api/auth/register', {
            email: "<script>alert(1)</script>@test.com",
            password: 'StrongPassword123!',
            role: 'student'
        });
        expect(res.status).toBe(422);
    });

    it('Body size limit -> 413', async () => {
        // Create 11kb string
        const largeStr = 'a'.repeat(11 * 1024);
        const res = await api('POST', '/api/solve', {
            operation: 'digital-root',
            input: 98,
            junk: largeStr
        });
        expect(res.status).toBe(413);
    });

    it('Security headers on GET /api/health', async () => {
        const res = await api('GET', '/api/health');
        expect(res.status).toBe(200);

        // Convert map/iterator entries to object for easy lookup
        const headersObj = {};
        for (let pair of res.headers.entries()) {
            headersObj[pair[0].toLowerCase()] = pair[1];
        }

        expect(headersObj['x-content-type-options']).toBe('nosniff');
        expect(headersObj['x-frame-options']).toBeTruthy();
        expect(headersObj['x-powered-by']).toBeFalsy();
    });

    it('SQL injection attempt -> 422', async () => {
        const res = await api('POST', '/api/auth/login', {
            email: "' OR '1'='1",
            password: "password"
        });
        expect(res.status).toBe(422);
    });
});
