/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * Achievement Service: Logic for awarding and checking user badges.
 */

const { v4: uuidv4 } = require('uuid');
const badgeRepo = require('../database/badge-repository');
const progressRepo = require('../database/progress-repository');
const practiceRepo = require('../database/practice-repository');

// Badge Definitions (Matching frontend IDs)
const BADGE_DEFS = [
    { id: "first-solve", title: "First Solve", check: async (stats) => stats.totalSolved >= 1 },
    { id: "ten-solves", title: "Ten Solves", check: async (stats) => stats.totalSolved >= 10 },
    { id: "century", title: "Century", check: async (stats) => stats.totalSolved >= 100 },
    { id: "streak-3", title: "On Fire", check: async (stats) => stats.streak >= 3 },
    { id: "streak-7", title: "Week Warrior", check: async (stats) => stats.streak >= 7 },
    { id: "practice-10", title: "Sharp Mind", check: async (stats, pr) => pr.totalAttempts >= 10 },
    { id: "accuracy-80", title: "High Accuracy", check: async (stats, pr) => pr.overallAccuracy >= 80 },
    { id: "vedic-master", title: "Vedic Master", check: async (stats) => Object.keys(stats.operationBreakdown).length >= 5 }
];

/**
 * Checks and awards new badges for a user based on their latest stats.
 */
async function checkAndAwardBadges(userId, stats, practiceStats) {
    const existingBadges = await badgeRepo.getByUserId(userId);
    const existingIds = existingBadges.map(b => b.badge_id);

    const newBadges = [];
    const now = new Date().toISOString();

    for (const def of BADGE_DEFS) {
        if (!existingIds.includes(def.id)) {
            const hasEarned = await def.check(stats, practiceStats);
            if (hasEarned) {
                const userBadge = {
                    userBadgeId: uuidv4(),
                    userId,
                    badgeId: def.id,
                    earnedAt: now,
                    notified: 0
                };
                await badgeRepo.insertBadge(userBadge);
                newBadges.push(def.id);
            }
        }
    }

    return newBadges;
}

module.exports = {
    checkAndAwardBadges,
    BADGE_DEFS
};
