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
 * Purpose: Admin-only security management API.
 */

const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../auth/auth-middleware');
const securityRepo = require('../database/security-repository');
const ipBlacklist = require('../middleware/ip-blacklist');

const ATTRIBUTION = "GanitSūtram | AITDL";

// All routes require admin
router.use(requireAuth, requireRole('admin'));

/**
 * GET /api/security/blacklist
 */
router.get('/blacklist', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const blocked = await securityRepo.getBlacklist({ limit, offset, active: true });

        res.status(200).json({
            blocked,
            total: blocked.length,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/security/blacklist
 */
router.post('/blacklist', async (req, res) => {
    try {
        const { ip, reason, expiresInMinutes } = req.body;
        if (!ip || !reason) return res.status(400).json({ error: "IP and reason required." });

        await securityRepo.blacklistIP(ip, reason, expiresInMinutes, req.user.userId);
        ipBlacklist.invalidateCache();

        res.status(201).json({ message: "IP blocked.", attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/security/blacklist/:ip
 */
router.delete('/blacklist/:ip', async (req, res) => {
    try {
        await securityRepo.removeFromBlacklist(req.params.ip);
        ipBlacklist.invalidateCache();
        res.status(200).json({ message: "IP unblocked.", attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/security/whitelist
 */
router.get('/whitelist', async (req, res) => {
    try {
        const whitelist = await securityRepo.getAllWhitelist();
        res.status(200).json({ whitelist, attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/security/whitelist
 */
router.post('/whitelist', async (req, res) => {
    try {
        const { ip, label } = req.body;
        if (!ip) return res.status(400).json({ error: "IP required." });

        await securityRepo.whitelistIP(ip, label, req.user.userId);
        ipBlacklist.invalidateCache();
        res.status(201).json({ message: "IP whitelisted.", attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/security/whitelist/:ip
 */
router.delete('/whitelist/:ip', async (req, res) => {
    try {
        await securityRepo.removeFromWhitelist(req.params.ip);
        ipBlacklist.invalidateCache();
        res.status(200).json({ message: "IP removed from whitelist.", attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/security/threats
 */
router.get('/threats', async (req, res) => {
    try {
        const { ip, hours = 24, limit = 50 } = req.query;
        let threats;
        if (ip) {
            threats = await securityRepo.getThreatsByIP(ip, parseInt(hours));
        } else {
            // General threat log not implemented in repo, let's add simple fetch
            const db = require('../database/db');
            threats = await db.all('SELECT * FROM threat_log ORDER BY detected_at DESC LIMIT ?', parseInt(limit));
        }

        res.status(200).json({ threats, total: threats.length, attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/security/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await securityRepo.getSecurityStats();
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/security/prune
 */
router.post('/prune', async (req, res) => {
    try {
        const pruned = await securityRepo.pruneExpired();
        res.status(200).json({ pruned, attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
