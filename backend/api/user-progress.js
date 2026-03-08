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
 * Purpose: API routes for user progress tracking.
 */

const express = require('express');
const router = express.Router();
const progressService = require('../services/progress-service');
const { requireAuth } = require('../auth/auth-middleware');
const { errorResponse, successResponse } = require('../services/i18n-service');

const ATTRIBUTION = "GanitSūtram | AITDL";

/**
 * GET /api/user-progress
 * Returns paginated progress entries for the authenticated user.
 */
router.get('/', requireAuth, async (req, res) => {
    const { operation, limit, offset } = req.query;
    const userId = req.user.userId;

    const [entries, stats] = await Promise.all([
        progressService.getProgress(userId, {
            operation,
            limit: parseInt(limit) || 50,
            offset: parseInt(offset) || 0
        }),
        progressService.getStats(userId)
    ]);

    res.json({
        userId,
        total: stats.totalSolved,
        entries,
        attribution: ATTRIBUTION
    });
});

/**
 * POST /api/user-progress
 * Manually adds a progress entry.
 */
router.post('/', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { operation, input, inputA, inputB, result, steps, timeTakenMs } = req.body;

    if (!operation || (input === undefined && inputA === undefined && inputB === undefined) || result === undefined) {
        return res.status(422).json(errorResponse(req.locale, 'errors.validation.requiredField'));
    }

    const entry = await progressService.addProgress(userId, {
        operation,
        input,
        inputA,
        inputB,
        result,
        steps,
        timeTakenMs
    });

    res.status(201).json({
        progressId: entry.progressId,
        savedAt: entry.solvedAt,
        attribution: ATTRIBUTION
    });
});

/**
 * GET /api/user-progress/stats
 * Returns calculated statistics for the authenticated user.
 */
router.get('/stats', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const stats = await progressService.getStats(userId);

    res.json({
        stats,
        attribution: ATTRIBUTION
    });
});

/**
 * DELETE /api/user-progress
 * Clears all progress for the authenticated user.
 */
router.delete('/', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    await progressService.clearProgress(userId);

    res.json(successResponse(req.locale, 'success.progress.cleared'));
});

module.exports = router;
