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

async function getScore(userId) {
    return await db.get('SELECT * FROM user_scores WHERE user_id = ?', userId);
}

async function initScore(userId) {
    const scoreId = uuidv4();
    const now = new Date().toISOString();
    try {
        await db.run(`
            INSERT INTO user_scores (score_id, user_id, total_points, weekly_points, monthly_points, streak, last_updated)
            VALUES (?, ?, 0, 0, 0, 0, ?)
        `, scoreId, userId, now);
        return await getScore(userId);
    } catch (e) {
        // Handle concurrent insert if happens
        return await getScore(userId);
    }
}

async function updateScore(userId, totalPoints, weeklyPoints, monthlyPoints, streak) {
    const now = new Date().toISOString();
    await db.run(`
        UPDATE user_scores 
        SET total_points = ?, weekly_points = ?, monthly_points = ?, streak = ?, last_updated = ?
        WHERE user_id = ?
    `, totalPoints, weeklyPoints, monthlyPoints, streak, now, userId);
}

async function updateDisplayName(userId, displayName) {
    const now = new Date().toISOString();
    let score = await getScore(userId);
    if (!score) score = await initScore(userId);

    await db.run(`UPDATE user_scores SET display_name = ?, last_updated = ? WHERE user_id = ?`, displayName, now, userId);
}

async function insertPointEvent(userId, points, reason, operation) {
    const eventId = uuidv4();
    const now = new Date().toISOString();
    await db.run(`
        INSERT INTO point_events (event_id, user_id, points, reason, operation, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `, eventId, userId, points, reason, operation || null, now);
    return { eventId, points, reason, operation, created_at: now };
}

async function getPointHistory(userId, limit = 20) {
    return await db.all(`
        SELECT * FROM point_events 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    `, userId, limit);
}

async function getLeaderboard(type = 'global', limit = 25, offset = 0) {
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
    return await db.all(sql, limit, offset);
}

async function recalculateRanks() {
    // Update global rank
    await db.run(`
        UPDATE user_scores 
        SET rank_global = (
            SELECT COUNT(1) + 1 
            FROM user_scores s2 
            WHERE s2.total_points > user_scores.total_points
        )
    `);

    // Update weekly rank
    await db.run(`
        UPDATE user_scores 
        SET rank_weekly = (
            SELECT COUNT(1) + 1 
            FROM user_scores s2 
            WHERE s2.weekly_points > user_scores.weekly_points
        )
    `);
}

async function resetWeeklyPoints() {
    await db.run(`UPDATE user_scores SET weekly_points = 0, rank_weekly = NULL`);
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
