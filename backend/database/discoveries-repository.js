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
function getAllDiscoveries(category = null) {
    let query = 'SELECT * FROM discoveries';
    const params = [];

    if (category && category !== 'all') {
        query += ' WHERE category = ?';
        params.push(category);
    }

    query += ' ORDER BY sort_order ASC';
    return db.prepare(query).all(...params);
}

/**
 * Finds a discovery by its slug.
 */
function getDiscoveryBySlug(slug) {
    const discovery = db.prepare('SELECT * FROM discoveries WHERE slug = ?').get(slug);
    if (!discovery) return null;

    const patterns = getPatternsByDiscoveryId(discovery.discovery_id);
    return {
        ...discovery,
        patterns
    };
}

/**
 * Retrieves patterns for a specific discovery.
 */
function getPatternsByDiscoveryId(discoveryId) {
    return db.prepare('SELECT * FROM discovery_patterns WHERE discovery_id = ?').all(discoveryId);
}

module.exports = {
    getAllDiscoveries,
    getDiscoveryBySlug,
    getPatternsByDiscoveryId
};
