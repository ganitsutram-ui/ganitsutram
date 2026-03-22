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
 * Purpose: Data Access Object for Discoveries and Patterns.
 */

const db = require('./db');

/**
 * Retrieves all discoveries.
 */
async function getAllDiscoveries(category = null) {
    let query = 'SELECT * FROM discoveries';
    const params = [];

    if (category && category !== 'all') {
        query += ' WHERE category = ?';
        params.push(category);
    }

    query += ' ORDER BY sort_order ASC';
    return await db.all(query, ...params);
}

/**
 * Finds a discovery by its slug.
 */
async function getDiscoveryBySlug(slug) {
    const discovery = await db.get('SELECT * FROM discoveries WHERE slug = ?', slug);
    if (!discovery) return null;

    const patterns = await getPatternsByDiscoveryId(discovery.discovery_id);
    return {
        ...discovery,
        patterns
    };
}

/**
 * Retrieves patterns for a specific discovery.
 */
async function getPatternsByDiscoveryId(discoveryId) {
    return await db.all('SELECT * FROM discovery_patterns WHERE discovery_id = ?', discoveryId);
}

module.exports = {
    getAllDiscoveries,
    getDiscoveryBySlug,
    getPatternsByDiscoveryId
};
