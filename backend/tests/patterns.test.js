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

describe('Patterns API Tests', () => {

    it('GET /api/patterns/vedic -> 200, 6 patterns', async () => {
        const res = await api('GET', '/api/patterns/vedic');
        expect(res.status).toBe(200);
        expect(res.data.patterns.length).toBe(6);
    });

    it('GET /api/patterns/vedic/nine-complement -> 200', async () => {
        const res = await api('GET', '/api/patterns/vedic/nine-complement');
        expect(res.status).toBe(200);
        expect(res.data.pattern.name).toBe('nine-complement');
    });

    it('GET /api/patterns/vedic/unknown -> 404', async () => {
        const res = await api('GET', '/api/patterns/vedic/unknown');
        expect(res.status).toBe(404);
    });

    it('POST /api/patterns/analyse [2,4,6,8,10] -> isArithmeticProgression true', async () => {
        const res = await api('POST', '/api/patterns/analyse', { numbers: [2, 4, 6, 8, 10] });
        expect(res.status).toBe(200);
        expect(res.data.analysis.isArithmeticProgression).toBeTruthy();
    });

    it('POST /api/patterns/kaprekar {n:3087} -> constant 6174', async () => {
        const res = await api('POST', '/api/patterns/kaprekar', { n: 3087 });
        expect(res.status).toBe(200);
        expect(res.data.result.constant).toBe(6174);
    });

    it('POST /api/patterns/fibonacci {count:8} -> sequence [1,1,2,3,5,8,13,21]', async () => {
        const res = await api('POST', '/api/patterns/fibonacci', { count: 8 });
        expect(res.status).toBe(200);
        expect(res.data.fibonacci).toEqual([1, 1, 2, 3, 5, 8, 13, 21]);
    });
});
