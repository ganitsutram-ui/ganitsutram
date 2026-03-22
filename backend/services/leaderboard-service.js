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
 * Gregorian: 2026-03-08
 * 
 * Purpose: Service for handling leaderboard points, rankings, and user stats.
 */

const repo = require('../database/leaderboard-repository');
const progressRepo = require('../database/progress-repository');
const practiceRepo = require('../database/practice-repository');
const badgeService = require('./badge-service');

const POINTS = {
    solve: 10,
    solve_with_steps: 15,
    practice_correct: 5,
    practice_correct_fast: 8,
    first_solve_bonus: 50,
    new_operation_bonus: 20,
    kaprekar_solve: 25,
    nikhilam_solve: 25
};

async function awardPoints(userId, reason, points, operation = null) {
    // 1. Log the event
    await repo.insertPointEvent(userId, points, reason, operation);

    // 2. Update user score
    let score = await repo.getScore(userId);
    if (!score) {
        score = await repo.initScore(userId);
    }

    const updatedTotal = (score.total_points || 0) + points;
    const updatedWeekly = (score.weekly_points || 0) + points;
    const updatedMonthly = (score.monthly_points || 0) + points;

    await repo.updateScore(userId, updatedTotal, updatedWeekly, updatedMonthly, score.streak || 0);

    // 3. Trigger badge check (Async/Background)
    setImmediate(async () => {
        try {
            const stats = await gatherUserStats(userId);
            await badgeService.checkAndAwardBadges(userId, stats);
        } catch (e) {
            console.error('[LeaderboardService] Badge check failed:', e.message);
        }
    });

    return updatedTotal;
}

async function getUserRank(userId) {
    const score = await repo.getScore(userId);
    if (!score) return null;

    // Percentile is a placeholder logic for now
    // In a real app, this would be periodically calculated or derived from rank
    return {
        rankGlobal: score.rank_global,
        rankWeekly: score.rank_weekly,
        totalPoints: score.total_points,
        weeklyPoints: score.weekly_points,
        streak: score.streak || 0,
        percentile: 95 // Hardcoded fallback for UI
    };
}

async function getPointHistory(userId, limit = 20) {
    return await repo.getPointHistory(userId, limit);
}

async function getLeaderboard(type = 'global', limit = 25, offset = 0) {
    return await repo.getLeaderboard(type, limit, offset);
}

async function setDisplayName(userId, displayName) {
    if (!displayName || displayName.length < 3) throw new Error("Display name too short.");
    if (displayName.length > 20) throw new Error("Display name too long.");

    await repo.updateDisplayName(userId, displayName);
    return displayName;
}

/**
 * Aggregates statistics for badge criteria.
 */
async function gatherUserStats(userId) {
    const [progressStats, practiceStats, score] = await Promise.all([
        progressRepo.getStats(userId),
        practiceRepo.getStats(userId),
        repo.getScore(userId)
    ]);

    return {
        totalSolved: progressStats.totalSolved || 0,
        totalPractice: practiceStats.totalSolved || 0, // Using totalSolved as a proxy for completed practice items
        streak: score?.streak || 0
    };
}

module.exports = {
    POINTS,
    awardPoints,
    getUserRank,
    getPointHistory,
    getLeaderboard,
    setDisplayName,
    gatherUserStats
};
