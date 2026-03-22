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
 * Achievement Service: Logic for awarding and checking user badges.
 */
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Purpose: API routes for user progress tracking.
 */

const express = require('express');
const router = express.Router();
const progressService = require('../services/progress-service');
const achievementService = require('../services/achievement-service');
const practiceService = require('../services/practice-service');
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

    // Check for achievements asynchronously
    (async () => {
        try {
            const stats = await progressService.getStats(userId);
            const prStats = await practiceService.getStats(userId);
            await achievementService.checkAndAwardBadges(userId, stats, prStats);
        } catch (e) {
            console.error("Achievement check failed:", e);
        }
    })();

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

/**
 * GET /api/user-progress/badges
 * Returns the earned badges for the authenticated user.
 */
router.get('/badges', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const badgeRepo = require('../database/badge-repository');
    const badges = await badgeRepo.getUserBadges(userId);
    res.json({ badges, attribution: ATTRIBUTION });
});

module.exports = router;
