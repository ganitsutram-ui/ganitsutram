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
 * Purpose: Secured routes for platform metrics and public beacon endpoints.
 */

const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../auth/auth-middleware');
const analyticsService = require('../services/analytics-service');
const { trackEvent } = require('../middleware/event-tracker');
const { beaconLimiter } = require('../middleware/rate-limiter');
const { errorResponse } = require('../services/i18n-service');

const ATTRIBUTION = "GanitSūtram | AITDL";

/**
 * GET /api/analytics/dashboard
 * Protected: Admin only
 */
router.get('/dashboard', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const dashboard = await analyticsService.getPlatformDashboard({ days });
        res.status(200).json({
            dashboard,
            attribution: ATTRIBUTION
        });
    } catch (e) {
        console.error(e);
        res.status(500).json(errorResponse(req.locale, 'errors.general.serverError'));
    }
});

/**
 * GET /api/analytics/realtime
 * Protected: Admin only
 */
router.get('/realtime', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const realtime = await analyticsService.getRealtimeStats();
        res.status(200).json({
            realtime,
            generatedAt: new Date().toISOString(),
            attribution: ATTRIBUTION
        });
    } catch (e) {
        console.error(e);
        res.status(500).json(errorResponse(req.locale, 'errors.general.serverError'));
    }
});

/**
 * POST /api/analytics/beacon
 * Public. Rate Limited. Used by frontend UI to log non-auth views.
 */
router.post('/beacon', beaconLimiter, (req, res) => {
    const { eventType, metadata } = req.body;

    if (eventType !== 'page_view' && eventType !== 'discovery_view') {
        return res.status(400).json(errorResponse(req.locale, 'errors.validation.invalidRole'));
    }

    trackEvent(eventType, req, metadata || {});

    // Always return fast 200 to free client
    res.status(200).json({ ok: true });
});

module.exports = router;
