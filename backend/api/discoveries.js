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
router.get('/', (req, res) => {
    const { category } = req.query;
    try {
        const discoveries = discoveriesService.listDiscoveries(category);
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
router.get('/:slug', (req, res) => {
    const { slug } = req.params;
    try {
        const discovery = discoveriesService.getDiscoveryDetail(slug);

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
