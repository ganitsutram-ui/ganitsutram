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

describe('Discoveries API Tests', () => {

    it('GET /api/discoveries -> 200', async () => {
        const res = await api('GET', '/api/discoveries');
        expect(res.status).toBe(200);
        expect(res.data.discoveries.length).toBeGreaterThanOrEqual(8);
    });

    it('GET /api/discoveries?category=vedic', async () => {
        const res = await api('GET', '/api/discoveries?category=vedic');
        expect(res.status).toBe(200);
        res.data.discoveries.forEach(item => {
            expect(item.category).toBe('vedic');
        });
    });

    it('GET /api/discoveries/digital-root -> 200', async () => {
        const res = await api('GET', '/api/discoveries/digital-root');
        expect(res.status).toBe(200);
        expect(res.data.discovery.slug).toBe('digital-root');
    });

    it('GET /api/discoveries/unknown-slug -> 404', async () => {
        const res = await api('GET', '/api/discoveries/unknown-slug');
        expect(res.status).toBe(404);
    });

});
