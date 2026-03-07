/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Service logic parsing parallel queries and formatting stats.
 */

const repo = require('../database/analytics-repository');

function getPlatformDashboard(options = {}) {
    const days = parseInt(options.days) || 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    const endDate = now.toISOString();

    const summary = repo.getPlatformSummary();
    const dailyActiveUsers = repo.getDailyActiveUsers(startDate, endDate);
    const newUsersByDay = repo.getNewUsersByDay(startDate, endDate);
    const topOperations = repo.getTopOperations(10);
    const eventBreakdown = repo.getEventCounts({ startDate, endDate }).byType;
    const solvesPerDay = repo.getSolvesPerDay(startDate, endDate);
    const practiceAccuracy = repo.getPracticeAccuracyOverall();
    const hourlyDistribution = repo.getHourlyDistribution();

    return {
        summary,
        periodDays: days,
        dailyActiveUsers,
        newUsersByDay,
        topOperations,
        eventBreakdown,
        solvesPerDay,
        practiceAccuracy,
        hourlyDistribution
    };
}

function getRealtimeStats() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    const counts = repo.getEventCounts({ startDate: lastHour, endDate: now.toISOString() });

    // Calculate distinct DAU manually for the hour
    const db = require('../database/db');
    const activeSql = `
        SELECT COUNT(DISTINCT user_id) as count 
        FROM analytics_events 
        WHERE user_id IS NOT NULL AND created_at >= ?
    `;
    const activeRows = db.prepare(activeSql).get(lastHour);

    const topSql = `
        SELECT operation 
        FROM analytics_events 
        WHERE event_type = 'solve' AND operation IS NOT NULL AND created_at >= ?
        GROUP BY operation
        ORDER BY COUNT(*) DESC LIMIT 1
    `;
    const topOpRes = db.prepare(topSql).get(lastHour);

    const solvesThisHour = counts.byType.find(e => e.eventType === 'solve')?.count || 0;

    return {
        eventsLastHour: counts.total,
        activeUsersLastHour: activeRows.count || 0,
        solvesLastHour: solvesThisHour,
        topOperationLastHour: topOpRes ? topOpRes.operation : 'none',
    };
}

module.exports = {
    getPlatformDashboard,
    getRealtimeStats
};
