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
 * Purpose: Threat detection middleware. Analyses requests for malicious patterns.
 */

'use strict';

const securityRepo = require('../database/security-repository');
const ipBlacklist = require('./ip-blacklist');

const SQL_INJECTION = /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bEXEC\b|--|;|\/\*|\*\/|xp_|\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/i;
const XSS_PATTERN = /(<script[\s\S]*?>[\s\S]*?<\/script>|javascript\s*:|on\w+\s*=\s*["']?[^"'>\s]|<iframe|<object|<embed)/i;
const PATH_TRAVERSAL = /(\.\.\/|\.\.\\|%2e%2e|etc\/passwd|windows\/system32)/i;
const SCANNER_PATTERN = /(sqlmap|nikto|nessus|masscan|zgrab|nuclei|dirbuster|gobuster)/i;

const THRESHOLDS = {
    scanner: 1, // block immediately
    path_traversal: 1, // block immediately
    sql_injection: 3, // block after 3 attempts
    xss_attempt: 5, // block after 5 attempts
    auth_bruteforce: 10, // block after 10 attempts
    rate_abuse: 5 // block after 5 rate limit hits
};

/**
 * Handles threat logging and auto-blocking.
 */
async function handleThreat(ip, type, req, forceBlock = false) {
    const count = await securityRepo.getThreatCount(ip, 1);

    await securityRepo.logThreat({
        ip,
        threat_type: type,
        path: req.originalUrl,
        method: req.method,
        payload: JSON.stringify(req.body)?.slice(0, 500),
        user_agent: req.headers['user-agent'],
        autoBlocked: forceBlock || (count >= (THRESHOLDS[type] || 5) - 1)
    });

    if (forceBlock || count >= (THRESHOLDS[type] || 5) - 1) {
        await securityRepo.blacklistIP(
            ip,
            `auto_${type}`,
            type === 'scanner' ? null : 24 * 60, // 24h or permanent
            'system'
        );
        ipBlacklist.invalidateCache();
    }
}

const threatDetector = async function (req, res, next) {
    const ip = req.clientIP;
    const ua = req.headers['user-agent'] || '';
    const url = req.originalUrl;

    // 1. Check scanner user-agents first (fast)
    if (SCANNER_PATTERN.test(ua)) {
        await handleThreat(ip, 'scanner', req, true);
        return res.status(403).json({ error: 'Forbidden.', attribution: 'GanitSūtram | AITDL' });
    }

    // 2. Check path traversal in URL
    if (PATH_TRAVERSAL.test(url)) {
        await handleThreat(ip, 'path_traversal', req, true);
        return res.status(400).json({ error: 'Bad request.', attribution: 'GanitSūtram | AITDL' });
    }

    // 3. Check body threats
    if (req.body && typeof req.body === 'object') {
        const bodyStr = JSON.stringify(req.body);

        if (SQL_INJECTION.test(bodyStr)) {
            await handleThreat(ip, 'sql_injection', req, false);
            // Log but don't block immediately for SQLi to reduce false positives
        }

        if (XSS_PATTERN.test(bodyStr)) {
            await handleThreat(ip, 'xss_attempt', req, false);
            // Log but don't block immediately for XSS
        }
    }

    next();
};

// Export handleThreat for use in rate-limiter or other layers
threatDetector.handleThreat = handleThreat;

module.exports = threatDetector;
