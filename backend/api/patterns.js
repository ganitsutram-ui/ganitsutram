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
 * Purpose: Dedicated API for mathematical and Vedic pattern analysis.
 */

const express = require('express');
const router = express.Router();
const engine = require('../../core/math-engine/pattern-engine');
const { trackEvent } = require('../middleware/event-tracker');
const { errorResponse } = require('../services/i18n-service');

const ATTRIBUTION = "GanitSūtram | AITDL";

/**
 * GET /api/patterns/vedic
 * Returns all Vedic pattern definitions.
 */
router.get('/vedic', async (req, res) => {
    try {
        const patterns = engine.listVedicPatterns().map(p => engine.getVedicPattern(p.name));
        res.json({
            patterns,
            total: patterns.length,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        res.status(500).json(errorResponse(req.locale, 'errors.general.serverError'));
    }
});

/**
 * GET /api/patterns/vedic/:name
 * Returns single Vedic pattern by name.
 */
router.get('/vedic/:name', async (req, res) => {
    try {
        const pattern = engine.getVedicPattern(req.params.name);
        if (!pattern) return res.status(404).json(errorResponse(req.locale, 'errors.general.notFound'));
        res.json({ pattern, attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/patterns/analyse
 * Body: { "numbers": [2,4,6,8,10] }
 */
router.post('/analyse', async (req, res) => {
    try {
        const { numbers } = req.body;
        engine.validateNumberArray(numbers, 3, 100);
        const analysis = engine.analyseSequence(numbers);

        trackEvent('pattern_analyse', req, { length: numbers.length });

        res.json({ analysis, attribution: ATTRIBUTION });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /api/patterns/digital-root-cycle
 * Body: { "start": 1, "end": 27 }
 */
router.post('/digital-root-cycle', async (req, res) => {
    try {
        const { start, end } = req.body;
        engine.validateRange(start, end);
        const cycle = engine.detectDigitalRootCycle(start, end);
        res.json({ cycle, attribution: ATTRIBUTION });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /api/patterns/kaprekar
 * Body: { "n": 3087 }
 */
router.post('/kaprekar', async (req, res) => {
    try {
        const { n } = req.body;
        const result = engine.kaprekarRoutine(n);
        res.json({ result, attribution: ATTRIBUTION });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /api/patterns/fibonacci
 * Body: { "count": 24 }
 */
router.post('/fibonacci', async (req, res) => {
    try {
        const { count } = req.body;
        const fib = engine.fibonacci(count);
        const roots = engine.fibonacciDigitalRoots(count);
        res.json({
            fibonacci: fib,
            digitalRoots: roots,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /api/patterns/squares
 * Body: { "count": 9 }
 */
router.post('/squares', async (req, res) => {
    try {
        const { count } = req.body;
        const squares = engine.detectSquarePattern(count);
        res.json({ squares, attribution: ATTRIBUTION });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
