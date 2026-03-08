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
 * Purpose: Service logic parsing parallel queries and formatting stats.
 */

const repo = require('../database/analytics-repository');

async function getPlatformDashboard(options = {}) {
    const days = parseInt(options.days) || 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    const endDate = now.toISOString();

    const [summary, dailyActiveUsers, newUsersByDay, topOperations, eventCounts, solvesPerDay, practiceAccuracy, hourlyDistribution] = await Promise.all([
        repo.getPlatformSummary(),
        repo.getDailyActiveUsers(startDate, endDate),
        repo.getNewUsersByDay(startDate, endDate),
        repo.getTopOperations(10),
        repo.getEventCounts({ startDate, endDate }),
        repo.getSolvesPerDay(startDate, endDate),
        repo.getPracticeAccuracyOverall(),
        repo.getHourlyDistribution()
    ]);

    return {
        summary,
        periodDays: days,
        dailyActiveUsers,
        newUsersByDay,
        topOperations,
        eventBreakdown: eventCounts.byType,
        solvesPerDay,
        practiceAccuracy,
        hourlyDistribution
    };
}

async function getRealtimeStats() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    const counts = await repo.getEventCounts({ startDate: lastHour, endDate: now.toISOString() });

    // Calculate distinct DAU manually for the hour
    const activeSql = `
        SELECT COUNT(DISTINCT user_id) as count 
        FROM analytics_events 
        WHERE user_id IS NOT NULL AND created_at >= ?
    `;
    const activeRows = await db.get(activeSql, lastHour);

    const topSql = `
        SELECT operation 
        FROM analytics_events 
        WHERE event_type = 'solve' AND operation IS NOT NULL AND created_at >= ?
        GROUP BY operation
        ORDER BY COUNT(*) DESC LIMIT 1
    `;
    const topOpRes = await db.get(topSql, lastHour);

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
