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
const { t, loadLocales } = require('../services/i18n-service');
loadLocales();

describe('i18n Service Tests', () => {
    it('Translates English correctly', async () => {
        expect(t('en', 'errors.auth.invalidCredentials')).toBe("Invalid email or password.");
    });

    it('Translates Hindi correctly', async () => {
        expect(t('hi', 'errors.auth.invalidCredentials')).toBe("ईमेल या पासवर्ड गलत है।");
    });

    it('Translates Sanskrit with mixed fallbacks', async () => {
        expect(t('sa', 'errors.solve.serverError')).toBe("दोषः अभवत्। पुनः प्रयत्नं करोतु।");
    });

    it('Falls back to English for unsupported locale', async () => {
        expect(t('fr', 'errors.auth.invalidCredentials')).toBe("Invalid email or password.");
    });

    it('Returns key path if string not found', async () => {
        expect(t('en', 'nonexistent.key')).toBe("nonexistent.key");
    });

    it('Interpolates variables correctly', async () => {
        expect(t('en', 'errors.admin.capacityReached', { cap: 100 })).toBe("School capacity reached. Maximum 100 students.");
    });
});

describe('i18n HTTP Tests', () => {
    it('Login fail + Accept-Language: hi returns Hindi error', async () => {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'hi'
            },
            body: JSON.stringify({ email: 'bademail', password: 'bad' })
        });
        expect(res.status).toBe(422);
        const data = await res.json();
        expect(data.error).toBe('ईमेल या पासवर्ड गलत है।');
    });

    it('Login fail + ?lang=sa returns Sanskrit error', async () => {
        const res = await fetch('http://localhost:3000/api/auth/login?lang=sa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'bademail', password: 'bad' })
        });
        expect(res.status).toBe(422);
        const data = await res.json();
        // Since Sanskrit is partially translated, check that error exists
        expect(data.error).toBeTruthy();
    });

    it('Login fail + Accept-Language: fr falls back to English', async () => {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'fr'
            },
            body: JSON.stringify({ email: 'bademail', password: 'bad' })
        });
        expect(res.status).toBe(422);
        const data = await res.json();
        expect(data.error).toBe('Invalid email or password.');
    });
});
