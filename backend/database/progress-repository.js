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
 * Gregorian: 2026-03-07
 * 
 * Purpose: Data Access Object for Progress table.
 */

const db = require('./db');

/**
 * Inserts a progress entry.
 */
async function insertProgress(entry) {
    await db.run(`
        INSERT INTO progress (
            progress_id, user_id, operation, input, input_a, input_b, 
            result, steps, solved_at, time_taken_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        entry.progressId,
        entry.userId,
        entry.operation,
        entry.input ? String(entry.input) : null,
        entry.inputA ? String(entry.inputA) : null,
        entry.inputB ? String(entry.inputB) : null,
        String(entry.result),
        entry.steps ? JSON.stringify(entry.steps) : null,
        entry.solvedAt,
        entry.timeTakenMs
    );

    return entry;
}

/**
 * Helper: Map DB row to Progress object.
 */
function mapProgress(row) {
    if (!row) return null;
    return {
        progressId: row.progress_id,
        userId: row.user_id,
        operation: row.operation,
        input: row.input,
        inputA: row.input_a,
        inputB: row.input_b,
        result: row.result,
        steps: row.steps ? JSON.parse(row.steps) : null,
        solvedAt: row.solved_at,
        timeTakenMs: row.time_taken_ms
    };
}

/**
 * Fetch entries with limit/offset.
 */
async function getByUserId(userId, { operation, limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM progress WHERE user_id = ?';
    const params = [userId];

    if (operation) {
        query += ' AND operation = ?';
        params.push(operation);
    }

    query += ' ORDER BY solved_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await db.all(query, ...params);
    return rows.map(mapProgress);
}

/**
 * Count entries.
 */
async function countByUserId(userId, operation = null) {
    let query = 'SELECT COUNT(*) as count FROM progress WHERE user_id = ?';
    const params = [userId];

    if (operation) {
        query += ' AND operation = ?';
        params.push(operation);
    }

    const row = await db.get(query, ...params);
    return row.count;
}

/**
 * Get Breakdown.
 */
async function getOperationBreakdown(userId) {
    return await db.all(`
        SELECT operation, COUNT(*) as count 
        FROM progress 
        WHERE user_id = ? 
        GROUP BY operation
    `, userId);
}

/**
 * Get Distinct Days.
 */
async function getDistinctDays(userId) {
    const rows = await db.all(`
        SELECT DISTINCT date(solved_at) as day 
        FROM progress 
        WHERE user_id = ? 
        ORDER BY day DESC
    `, userId);
    return rows.map(r => r.day);
}

/**
 * Clear user history.
 */
async function deleteByUserId(userId) {
    const info = await db.run('DELETE FROM progress WHERE user_id = ?', userId);
    return info.changes;
}

/**
 * Cleanup: Maintain 500 entries per user limit.
 */
async function pruneUserProgress(userId, limit = 500) {
    await db.run(`
        DELETE FROM progress 
        WHERE progress_id IN (
            SELECT progress_id FROM progress 
            WHERE user_id = ? 
            ORDER BY solved_at DESC 
            LIMIT -1 OFFSET ?
        )
    `, userId, limit);
}

module.exports = {
    insertProgress,
    getByUserId,
    countByUserId,
    getOperationBreakdown,
    getDistinctDays,
    deleteByUserId,
    pruneUserProgress
};
