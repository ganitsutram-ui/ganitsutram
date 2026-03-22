const express = require('express');
const router = express.Router();
const searchRepo = require('../database/search-repository');

// Global search
router.get('/', async (req, res) => {
    try {
        const { q, type } = req.query;
        if (!q) return res.json({ results: [] });
        
        const results = await searchRepo.search(q, type);
        res.json({ results, attribution: "GanitSūtram | AITDL" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Suggestions
router.get('/suggest', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ suggestions: [] });
        
        const results = await searchRepo.search(q);
        const suggestions = results.slice(0, 5).map(r => ({
            title: r.title,
            slug: r.slug,
            doc_type: r.doc_type,
            doc_id: r.doc_id
        }));
        
        res.json({ suggestions, attribution: "GanitSūtram | AITDL" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Popular searches
router.get('/popular', async (req, res) => {
    try {
        const popular = await searchRepo.getPopular();
        res.json({ popular, attribution: "GanitSūtram | AITDL" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Trending searches
router.get('/trending', async (req, res) => {
    try {
        const trending = await searchRepo.getTrending();
        res.json({ trending, attribution: "GanitSūtram | AITDL" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
