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
 * Purpose: Express router for the Discoveries API.
 */

const express = require('express');
const router = express.Router();
const discoveriesService = require('../services/discoveries-service');
const { trackEvent } = require('../middleware/event-tracker');

const ATTRIBUTION = "GanitSūtram | AITDL";

/**
 * GET /api/discoveries
 */
router.get('/', async (req, res) => {
    const { category } = req.query;
    try {
        const discoveries = await discoveriesService.listDiscoveries(category);
        res.status(200).json({
            total: discoveries.length,
            category: category || 'all',
            discoveries,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch discoveries" });
    }
});

/**
 * GET /api/discoveries/:slug
 */
router.get('/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const discovery = await discoveriesService.getDiscoveryDetail(slug);

        // Track the view event
        trackEvent('discovery_view', req, { slug });

        res.status(200).json({
            discovery,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        if (err.message === "Discovery not found") {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: "Failed to fetch discovery details" });
    }
});

module.exports = router;
