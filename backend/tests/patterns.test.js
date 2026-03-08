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
