/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Repository for user badges.
 */

const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function getUserBadges(userId) {
    return await db.all(`
        SELECT * FROM user_badges
        WHERE user_id = ?
        ORDER BY earned_at DESC
    `, userId);
}

async function hasAwardedBadge(userId, badgeId) {
    const row = await db.get(`SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?`, userId, badgeId);
    return !!row;
}

async function awardBadge(userId, badgeId) {
    const exists = await hasAwardedBadge(userId, badgeId);
    if (exists) return false;

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(`
        INSERT INTO user_badges (user_badge_id, user_id, badge_id, earned_at)
        VALUES (?, ?, ?, ?)
    `, id, userId, badgeId, now);

    return true;
}

module.exports = {
    getUserBadges,
    hasAwardedBadge,
    awardBadge
};
