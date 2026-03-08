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
 * Gregorian: 2026-03-08
 *
 * Purpose: IP blacklisting middleware. High-performance filtering with in-memory cache.
 */

'use strict';

const securityRepo = require('../database/security-repository');

// In-memory cache for performance (avoids DB hit on every request)
const cache = {
    blacklist: new Set(),
    whitelist: new Set(),
    lastRefresh: 0,
    TTL: 60 * 1000 // refresh every 60 seconds
};

async function refreshCache() {
    const now = Date.now();
    if (now - cache.lastRefresh < cache.TTL) return;

    try {
        const [blocked, white] = await Promise.all([
            securityRepo.getBlacklist({ active: true, limit: 10000 }),
            securityRepo.getAllWhitelist()
        ]);

        cache.blacklist = new Set(blocked.map(r => r.ip));
        cache.whitelist = new Set(white.map(r => r.ip));
        cache.lastRefresh = now;
    } catch (err) {
        console.error('[Security Cache] Failed to refresh:', err.message);
    }
}

/**
 * Extracts the real client IP, prioritizing Cloudflare headers.
 */
function getClientIP(req) {
    let ip = req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
        req.socket.remoteAddress;

    // Normalize: strip IPv6 prefix for IPv4-mapped addresses
    if (ip && ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    return ip;
}

const ipBlacklist = async function (req, res, next) {
    await refreshCache();

    const ip = getClientIP(req);
    req.clientIP = ip; // Attach for downstream use

    // Whitelisted IPs always pass
    if (cache.whitelist.has(ip)) return next();

    // Blocked IPs -> 403
    if (cache.blacklist.has(ip)) {
        return res.status(403).json({
            error: 'Access denied.',
            attribution: 'GanitSūtram | AITDL'
        });
    }

    next();
};

// Export cache invalidation for use when the blacklist is updated via admin API
ipBlacklist.invalidateCache = function () {
    cache.lastRefresh = 0;
};

// Also export helper for tests
ipBlacklist.getClientIP = getClientIP;

module.exports = ipBlacklist;
