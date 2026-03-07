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
router.get('/', requireAuth, (req, res) => {
    const { operation, limit, offset } = req.query;
    const userId = req.user.userId;

    const entries = progressService.getProgress(userId, {
        operation,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0
    });

    const total = progressService.getStats(userId).totalSolved;

    res.json({
        userId,
        total,
        entries,
        attribution: ATTRIBUTION
    });
});

/**
 * POST /api/user-progress
 * Manually adds a progress entry.
 */
router.post('/', requireAuth, (req, res) => {
    const userId = req.user.userId;
    const { operation, input, inputA, inputB, result, steps, timeTakenMs } = req.body;

    if (!operation || (input === undefined && inputA === undefined && inputB === undefined) || result === undefined) {
        return res.status(422).json(errorResponse(req.locale, 'errors.validation.requiredField'));
    }

    const entry = progressService.addProgress(userId, {
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
router.get('/stats', requireAuth, (req, res) => {
    const userId = req.user.userId;
    const stats = progressService.getStats(userId);

    res.json({
        stats,
        attribution: ATTRIBUTION
    });
});

/**
 * DELETE /api/user-progress
 * Clears all progress for the authenticated user.
 */
router.delete('/', requireAuth, (req, res) => {
    const userId = req.user.userId;
    progressService.clearProgress(userId);

    res.json(successResponse(req.locale, 'success.progress.cleared'));
});

module.exports = router;
