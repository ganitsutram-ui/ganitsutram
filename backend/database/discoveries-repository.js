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
