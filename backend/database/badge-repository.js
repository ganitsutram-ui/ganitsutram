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

function getUserBadges(userId) {
    return db.prepare(`
        SELECT * FROM user_badges
        WHERE user_id = ?
        ORDER BY earned_at DESC
    `).all(userId);
}

function hasAwardedBadge(userId, badgeId) {
    const row = db.prepare(`SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?`).get(userId, badgeId);
    return !!row;
}

function awardBadge(userId, badgeId) {
    if (hasAwardedBadge(userId, badgeId)) return false;

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
        INSERT INTO user_badges (user_badge_id, user_id, badge_id, earned_at)
        VALUES (?, ?, ?, ?)
    `).run(id, userId, badgeId, now);

    return true;
}

module.exports = {
    getUserBadges,
    hasAwardedBadge,
    awardBadge
};
