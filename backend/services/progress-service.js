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
 * Purpose: Business logic for user progress tracking.
 *          Handles stats calculations and streaks using SQLite repository.
 */

const { v4: uuidv4 } = require('uuid');
const progressRepository = require('../database/progress-repository');

/**
 * Adds a new progress entry for a user.
 * @param {string} userId 
 * @param {Object} entryData 
 * @returns {Object}
 */
async function addProgress(userId, entryData) {
    const entry = {
        progressId: uuidv4(),
        userId,
        operation: entryData.operation,
        input: entryData.input,
        inputA: entryData.inputA || null,
        inputB: entryData.inputB || null,
        result: entryData.result,
        steps: entryData.steps || null,
        solvedAt: new Date().toISOString(),
        timeTakenMs: entryData.timeTakenMs || 0
    };

    await progressRepository.insertProgress(entry);
    // Maintain the 500-entry limit in DB too
    await progressRepository.pruneUserProgress(userId, 500);

    return entry;
}

/**
 * Retrieves progress history with filtering and pagination.
 */
async function getProgress(userId, options = {}) {
    return await progressRepository.getByUserId(userId, options);
}

/**
 * Calculates user statistics.
 */
async function getStats(userId) {
    const totalSolved = await progressRepository.countByUserId(userId);

    if (totalSolved === 0) {
        return {
            totalSolved: 0,
            operationBreakdown: {},
            mostUsedOperation: null,
            firstSolvedAt: null,
            lastSolvedAt: null,
            streak: 0
        };
    }

    const breakdownRows = await progressRepository.getOperationBreakdown(userId);
    const operationBreakdown = {};
    let mostUsedOperation = null;
    let maxCount = 0;

    breakdownRows.forEach(row => {
        operationBreakdown[row.operation] = row.count;
        if (row.count > maxCount) {
            maxCount = row.count;
            mostUsedOperation = row.operation;
        }
    });

    const dates = await progressRepository.getDistinctDays(userId);
    const streak = calculateStreakFromDates(dates);

    // Get first and last solve dates
    const lastEntries = await progressRepository.getByUserId(userId, { limit: 1, offset: 0 });
    const firstEntries = await progressRepository.getByUserId(userId, { limit: 1, offset: totalSolved - 1 });

    return {
        totalSolved,
        operationBreakdown,
        mostUsedOperation,
        firstSolvedAt: firstEntries.length ? firstEntries[0].solved_at : null,
        lastSolvedAt: lastEntries.length ? lastEntries[0].solved_at : null,
        streak
    };
}

/**
 * Helper: Calculate streak from sorted date strings (newest first).
 */
function calculateStreakFromDates(sortedDates) {
    if (!sortedDates || sortedDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If no solve today or yesterday, streak is broken
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = new Date(sortedDates[i]);
        const next = new Date(sortedDates[i + 1]);
        const diffDays = Math.round((current - next) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Clears all progress for a user.
 */
async function clearProgress(userId) {
    return await progressRepository.deleteByUserId(userId);
}

module.exports = {
    addProgress,
    getProgress,
    getStats,
    clearProgress
};
