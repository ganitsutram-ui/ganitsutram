/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

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
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: End-to-end tests for the CMS module using the custom test runner.
 */

async function api(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const url = `http://127.0.0.1:3000${path}`;
    try {
        const res = await fetch(url, options);
        let data;
        try {
            data = await res.json();
        } catch (e) {
            data = null;
        }
        if (res.status === 404) {
            console.warn(`[DEBUG] 404 on ${method} ${url}`);
        }
        return { status: res.status, data };
    } catch (err) {
        console.error(`[DEBUG] Fetch error on ${url}:`, err.message);
        return { status: 500, data: { error: err.message } };
    }
}

describe('CMS API Tests', () => {
    let adminToken = '';
    let testContentId = '';
    const testSlug = 'test-sutra-' + Date.now();

    it('Admin Login -> 200', async () => {
        const { status, data } = await api('POST', '/api/auth/login', {
            email: 'admin@ganitsutram.com',
            password: 'adminp@ssword'
        });
        expect(status).toBe(200);
        adminToken = data.token;
        expect(adminToken).toBeTruthy();
    });

    it('Create Draft (Admin) -> 201', async () => {
        const { status, data } = await api('POST', '/api/cms/admin/content', {
            content_type: 'sutra',
            slug: testSlug,
            title_en: 'Test Sutra',
            body_en: '# Vedic Logic\nTesting the CMS implementation.'
        }, adminToken);

        expect(status).toBe(201);
        testContentId = data.content.content_id;
        expect(testContentId).toBeTruthy();
    });

    it('Draft NOT publicly visible -> 404', async () => {
        const { status } = await api('GET', `/api/cms/content/${testSlug}`);
        expect(status).toBe(404);
    });

    it('Update Draft (Add Localization) -> 200', async () => {
        const { status, data } = await api('PUT', `/api/cms/admin/content/${testContentId}`, {
            title_hi: 'परीक्षण सूत्र',
            body_hi: 'हिंदी परीक्षण',
            change_summary: 'Added Hindi translation'
        }, adminToken);

        expect(status).toBe(200);
        expect(data.content.title_hi).toBe('परीक्षण सूत्र');
    });

    it('Publish Content -> 200', async () => {
        const { status } = await api('POST', `/api/cms/admin/content/${testContentId}/publish`, {}, adminToken);
        expect(status).toBe(200);
    });

    it('Public Fetch (EN) -> 200', async () => {
        const { status, data } = await api('GET', `/api/cms/content/${testSlug}`);
        expect(status).toBe(200);
        expect(data.content.title_en).toBe('Test Sutra');
    });

    it('Public Fetch (HI Locale) -> 200', async () => {
        const { status, data } = await api('GET', `/api/cms/content/${testSlug}?locale=hi`);
        expect(status).toBe(200);
        expect(data.content.title).toBe('परीक्षण सूत्र');
    });

    it('Search published content -> 200', async () => {
        const { status, data } = await api('GET', `/api/cms/search?q=Vedic`);
        expect(status).toBe(200);
        expect(data.results.length).toBeGreaterThan(0);
    });

    it('Check Revision History -> 200', async () => {
        const { status, data } = await api('GET', `/api/cms/admin/content/${testContentId}/revisions`, null, adminToken);
        expect(status).toBe(200);
        expect(data.revisions.length).toBeGreaterThan(0);
    });

    it('Delete Content (Admin) -> 200', async () => {
        const { status } = await api('DELETE', `/api/cms/admin/content/${testContentId}`, null, adminToken);
        expect(status).toBe(200);
    });

    it('Verify Deleted -> 404', async () => {
        const { status } = await api('GET', `/api/cms/content/${testSlug}`);
        expect(status).toBe(404);
    });

    it('Sync Discoveries -> 200', async () => {
        const { status, data } = await api('POST', `/api/cms/admin/sync`, {}, adminToken);
        expect(status).toBe(200);
        expect(data.message).toBe('Sync complete.');
    });
});
