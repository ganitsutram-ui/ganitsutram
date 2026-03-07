/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Repository for leaderboard, points, and event tracking.
 */

const db = require('./db');
const { v4: uuidv4 } = require('uuid');

function getScore(userId) {
    const stmt = db.prepare('SELECT * FROM user_scores WHERE user_id = ?');
    return stmt.get(userId);
}

function initScore(userId) {
    const scoreId = uuidv4();
    const now = new Date().toISOString();
    try {
        db.prepare(`
            INSERT INTO user_scores (score_id, user_id, total_points, weekly_points, monthly_points, streak, last_updated)
            VALUES (?, ?, 0, 0, 0, 0, ?)
        `).run(scoreId, userId, now);
        return getScore(userId);
    } catch (e) {
        // Handle concurrent insert if happens
        return getScore(userId);
    }
}

function updateScore(userId, totalPoints, weeklyPoints, monthlyPoints, streak) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
        UPDATE user_scores 
        SET total_points = ?, weekly_points = ?, monthly_points = ?, streak = ?, last_updated = ?
        WHERE user_id = ?
    `);
    stmt.run(totalPoints, weeklyPoints, monthlyPoints, streak, now, userId);
}

function updateDisplayName(userId, displayName) {
    const now = new Date().toISOString();
    let score = getScore(userId);
    if (!score) score = initScore(userId);

    const stmt = db.prepare(`UPDATE user_scores SET display_name = ?, last_updated = ? WHERE user_id = ?`);
    stmt.run(displayName, now, userId);
}

function insertPointEvent(userId, points, reason, operation) {
    const eventId = uuidv4();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
        INSERT INTO point_events (event_id, user_id, points, reason, operation, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(eventId, userId, points, reason, operation || null, now);
    return { eventId, points, reason, operation, created_at: now };
}

function getPointHistory(userId, limit = 20) {
    return db.prepare(`
        SELECT * FROM point_events 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    `).all(userId, limit);
}

function getLeaderboard(type = 'global', limit = 25, offset = 0) {
    let orderCol = 'total_points';
    if (type === 'weekly') orderCol = 'weekly_points';
    if (type === 'monthly') orderCol = 'monthly_points';

    const sql = `
        SELECT us.*, u.email, 
               (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = us.user_id) as badge_count,
               (SELECT badge_id FROM user_badges ub WHERE ub.user_id = us.user_id ORDER BY earned_at DESC LIMIT 1) as top_badge
        FROM user_scores us
        JOIN users u ON us.user_id = u.user_id
        ORDER BY us.${orderCol} DESC, us.last_updated ASC
        LIMIT ? OFFSET ?
    `;
    return db.prepare(sql).all(limit, offset);
}

function recalculateRanks() {
    // SQLite subquery rank update
    // Update global rank
    db.prepare(`
        UPDATE user_scores 
        SET rank_global = (
            SELECT COUNT(1) + 1 
            FROM user_scores s2 
            WHERE s2.total_points > user_scores.total_points
        )
    `).run();

    // Update weekly rank
    db.prepare(`
        UPDATE user_scores 
        SET rank_weekly = (
            SELECT COUNT(1) + 1 
            FROM user_scores s2 
            WHERE s2.weekly_points > user_scores.weekly_points
        )
    `).run();
}

function resetWeeklyPoints() {
    db.prepare(`UPDATE user_scores SET weekly_points = 0, rank_weekly = NULL`).run();
}

module.exports = {
    getScore,
    initScore,
    updateScore,
    updateDisplayName,
    insertPointEvent,
    getPointHistory,
    getLeaderboard,
    recalculateRanks,
    resetWeeklyPoints
};
