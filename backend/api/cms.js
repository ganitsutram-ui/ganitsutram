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
 * Purpose: CMS API controller for GanitSūtram.
 */

const express = require('express');
const router = express.Router();
const cmsService = require('../services/cms-service');
const { requireAuth, requireRole } = require('../auth/auth-middleware');

/**
 * GET /api/cms/content/:type
 * Public: Get published content by type.
 */
router.get('/content/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const locale = req.query.locale || 'en';
        const content = await cmsService.getPublishedContent(type, {}, locale);
        res.json({ data: content, attribution: "GanitSūtram | AITDL" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/cms/admin/content/:type
 * Admin: Get all content by type (including drafts).
 */
router.get('/admin/content/:type', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const { type } = req.params;
        const content = await cmsService.getContentForAdmin(type);
        res.json({ data: content, attribution: "GanitSūtram | AITDL" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/cms/content
 * Admin: Create new content.
 */
router.post('/content', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const content = await cmsService.createContent(req.user.user_id, req.body);
        res.status(201).json({ data: content, attribution: "GanitSūtram | AITDL" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * PATCH /api/cms/content/:id
 * Admin: Update content.
 */
router.patch('/content/:id', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const content = await cmsService.updateContent(req.params.id, req.user.user_id, req.body);
        res.json({ data: content, attribution: "GanitSūtram | AITDL" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /api/cms/publish/:id
 * Admin: Publish content.
 */
router.post('/publish/:id', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const content = await cmsService.publishContent(req.params.id, req.user.user_id);
        res.json({ data: content, attribution: "GanitSūtram | AITDL" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /api/cms/sync-discoveries
 * Admin: Sync legacy discoveries to CMS.
 */
router.post('/sync-discoveries', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const synced = await cmsService.syncDiscoveriesToCMS();
        res.json({ synced, message: `Successfully synced ${synced} discoveries.`, attribution: "GanitSūtram | AITDL" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
