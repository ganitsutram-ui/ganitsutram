/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Business logic for mathematical discoveries.
 */

const discoveriesRepository = require('../database/discoveries-repository');

/**
 * Lists discoveries with optional categorization.
 */
function listDiscoveries(category = null) {
    return discoveriesRepository.getAllDiscoveries(category);
}

/**
 * Gets full details for a discovery including patterns.
 */
function getDiscoveryDetail(slug) {
    const discovery = discoveriesRepository.getDiscoveryBySlug(slug);
    if (!discovery) {
        throw new Error("Discovery not found");
    }
    return discovery;
}

module.exports = {
    listDiscoveries,
    getDiscoveryDetail
};
