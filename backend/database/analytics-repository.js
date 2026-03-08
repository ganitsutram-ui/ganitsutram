/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Repository logic for fetching and aggregating platform data.
 */

const db = require('./db');

async function insertEvent(event) {
    return await db.run(`
        INSERT INTO analytics_events (
            event_id, event_type, user_id, session_id, operation, metadata, ip_hint, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        event.eventId, event.eventType, event.userId, event.sessionId,
        event.operation, event.metadata, event.ipHint, event.userAgent, event.createdAt
    );
}

async function getEventCounts(options = {}) {
    let sql = `SELECT event_type as eventType, COUNT(*) as count FROM analytics_events`;
    const params = [];
    const conditions = [];

    if (options.startDate) {
        conditions.push(`created_at >= ?`);
        params.push(options.startDate);
    }
    if (options.endDate) {
        conditions.push(`created_at <= ?`);
        params.push(options.endDate);
    }

    if (conditions.length > 0) sql += ` WHERE ` + conditions.join(' AND ');
    sql += ` GROUP BY event_type ORDER BY count DESC`;

    const byType = await db.all(sql, ...params);
    const total = byType.reduce((sum, row) => sum + row.count, 0);

    return { total, byType };
}

async function getDailyActiveUsers(startDate, endDate) {
    const sql = `
        SELECT date(created_at) as date, COUNT(DISTINCT user_id) as dau
        FROM analytics_events
        WHERE user_id IS NOT NULL AND created_at >= ? AND created_at <= ?
        GROUP BY date(created_at)
        ORDER BY date ASC
    `;
    return await db.all(sql, startDate, endDate);
}

async function getNewUsersByDay(startDate, endDate) {
    const sql = `
        SELECT date(created_at) as date, COUNT(user_id) as newUsers
        FROM users
        WHERE created_at >= ? AND created_at <= ?
        GROUP BY date(created_at)
        ORDER BY date ASC
    `;
    return await db.all(sql, startDate, endDate);
}

async function getTopOperations(limit) {
    const sql = `
        SELECT operation, COUNT(*) as count
        FROM analytics_events
        WHERE event_type = 'solve' AND operation IS NOT NULL
        GROUP BY operation
        ORDER BY count DESC
        LIMIT ?
    `;
    const results = await db.all(sql, limit);

    // Convert to percentage
    const totalRow = await db.get("SELECT COUNT(*) as t FROM analytics_events WHERE event_type = 'solve'");
    const total = totalRow.t || 1;

    return results.map(r => ({
        operation: r.operation,
        count: r.count,
        percentage: Math.round((r.count / total) * 100)
    }));
}

async function getPracticeAccuracyOverall() {
    const sql = `
        SELECT COUNT(*) as totalAttempts, SUM(is_correct) as totalCorrect
        FROM practice_attempts
    `;
    const row = await db.get(sql);
    const totalAttempts = row.totalAttempts || 0;
    const totalCorrect = row.totalCorrect || 0;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    return { totalAttempts, totalCorrect, accuracy };
}

async function getHourlyDistribution() {
    // SQLite strftime('%H') returns hour 00-23
    const sql = `
        SELECT strftime('%H', created_at) as hourStr, COUNT(*) as count
        FROM analytics_events
        GROUP BY hourStr
        ORDER BY hourStr ASC
    `;
    const rows = await db.all(sql);
    return rows.map(r => ({
        hour: parseInt(r.hourStr, 10),
        count: r.count
    }));
}

async function getPlatformSummary() {
    const totalUsers = (await db.get(`SELECT COUNT(*) as c FROM users`)).c;
    const totalSolves = (await db.get(`SELECT COUNT(*) as c FROM progress`)).c;
    const totalPractice = (await db.get(`SELECT COUNT(*) as c FROM practice_attempts`)).c;

    const pageRow = await db.get(`SELECT COUNT(*) as c FROM analytics_events WHERE event_type = 'page_view'`);
    const discoRow = await db.get(`SELECT COUNT(*) as c FROM analytics_events WHERE event_type = 'discovery_view'`);

    // 30 day avg DAU
    const startDate30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dauRows = await db.all(`
        SELECT COUNT(DISTINCT user_id) as dau 
        FROM analytics_events 
        WHERE user_id IS NOT NULL AND created_at >= ?
        GROUP BY date(created_at)
    `, startDate30);

    const sumDau = dauRows.reduce((acc, row) => acc + row.dau, 0);
    const avgDailyActive = dauRows.length > 0 ? Math.round(sumDau / dauRows.length) : 0;

    return {
        totalUsers,
        totalSolves,
        totalPracticeAttempts: totalPractice,
        totalDiscoveryViews: discoRow ? discoRow.c : 0,
        totalPageViews: pageRow ? pageRow.c : 0,
        avgDailyActive
    };
}

async function getSolvesPerDay(startDate, endDate) {
    const sql = `
        SELECT date(created_at) as date, COUNT(*) as count
        FROM analytics_events
        WHERE event_type = 'solve' AND created_at >= ? AND created_at <= ?
        GROUP BY date(created_at)
        ORDER BY date ASC
    `;
    return await db.all(sql, startDate, endDate);
}

module.exports = {
    insertEvent,
    getEventCounts,
    getDailyActiveUsers,
    getNewUsersByDay,
    getTopOperations,
    getPracticeAccuracyOverall,
    getHourlyDistribution,
    getPlatformSummary,
    getSolvesPerDay
};
