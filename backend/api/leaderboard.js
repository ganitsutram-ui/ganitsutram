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
 * Purpose: Express router for the gamification ecosystem.
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../auth/auth-middleware');
const leaderboardService = require('../services/leaderboard-service');
const badgeService = require('../services/badge-service');
const { errorResponse } = require('../services/i18n-service');

const ATTRIBUTION = "GanitSūtram | AITDL";

/**
 * GET /api/leaderboard
 * Public endpoint exposing ranked users
 */
router.get('/', async (req, res) => {
    try {
        const type = req.query.type || 'global';
        const limit = parseInt(req.query.limit) || 25;
        const offset = parseInt(req.query.offset) || 0;

        const data = await leaderboardService.getLeaderboard(type, limit, offset);

        res.status(200).json({
            type,
            total: data.length, // Not actual total, but array length
            leaderboard: data,
            generatedAt: new Date().toISOString(),
            attribution: ATTRIBUTION
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(errorResponse(req.locale, 'errors.general.serverError'));
    }
});

/**
 * GET /api/leaderboard/me
 * Protected endpoint returning user rank and badge progress
 */
router.get('/me', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const [rank, pointHistory, stats, earnedBadgesData] = await Promise.all([
            leaderboardService.getUserRank(userId),
            leaderboardService.getPointHistory(userId, 20),
            leaderboardService.gatherUserStats(userId),
            badgeService.getUserBadges(userId)
        ]);

        const rankFinal = rank || { rankGlobal: null, rankWeekly: null, totalPoints: 0, weeklyPoints: 0, percentile: 100 };
        const badgeProgress = await badgeService.getBadgeProgress(userId, stats);

        const badges = await Promise.all(earnedBadgesData.map(async ub => ({
            ...await badgeService.getBadgeById(ub.badge_id),
            earned_at: ub.earned_at
        })));

        res.status(200).json({
            rank: rankFinal,
            pointHistory,
            badges,
            badgeProgress: badgeProgress.filter(bp => !bp.earned),
            attribution: ATTRIBUTION
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(errorResponse(req.locale, 'errors.general.serverError'));
    }
});

/**
 * POST /api/leaderboard/display-name
 * Protected endpoint for updating alias
 */
router.post('/display-name', requireAuth, async (req, res) => {
    try {
        const { displayName } = req.body;
        const alias = await leaderboardService.setDisplayName(req.user.userId, displayName);

        res.status(200).json({
            displayName: alias,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        res.status(400).json({ error: err.message || "Failed to set display name" });
    }
});

/**
 * GET /api/leaderboard/badges
 * Public endpoint exposing all possible badges
 */
router.get('/badges', async (req, res) => {
    const badges = await badgeService.getAllBadges();
    res.status(200).json({
        badges,
        total: badges.length,
        attribution: ATTRIBUTION
    });
});

module.exports = router;
