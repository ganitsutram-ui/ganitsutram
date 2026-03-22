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
 * Purpose: Backend i18n Service to localise API responses
 */

const fs = require('fs');
const path = require('path');

const locales = {};

function loadLocales() {
    const localesDir = path.join(__dirname, '..', 'locales');
    const files = ['en.json', 'hi.json', 'sa.json'];

    files.forEach(file => {
        try {
            const filePath = path.join(localesDir, file);
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                const localeCode = file.replace('.json', '');
                locales[localeCode] = JSON.parse(data);
            }
        } catch (e) {
            console.error(`[i18n-service] Failed to load locale ${file}:`, e);
        }
    });
}

function t(locale, key, vars = {}) {
    let result = resolveKey(locales[locale], key);

    // Fallback chain: requested locale -> en -> literal key string
    if (result === undefined && locale !== 'en') {
        result = resolveKey(locales['en'], key);
    }

    if (result === undefined) {
        return key;
    }

    if (typeof result !== 'string') return result;

    // Handle variable interpolation
    return result.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
        const varName = p1.trim();
        return vars[varName] !== undefined ? vars[varName] : match;
    });
}

function resolveKey(obj, pathString) {
    if (!obj) return undefined;
    return pathString.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function errorResponse(locale, key, vars = {}) {
    return { error: t(locale, key, vars) };
}

function successResponse(locale, key, vars = {}) {
    return { message: t(locale, key, vars) };
}

module.exports = {
    loadLocales,
    t,
    errorResponse,
    successResponse
};
