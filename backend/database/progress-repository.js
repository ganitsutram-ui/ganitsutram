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
function insertProgress(entry) {
    const stmt = db.prepare(`
        INSERT INTO progress (
            progress_id, user_id, operation, input, input_a, input_b, 
            result, steps, solved_at, time_taken_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
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
function getByUserId(userId, { operation, limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM progress WHERE user_id = ?';
    const params = [userId];

    if (operation) {
        query += ' AND operation = ?';
        params.push(operation);
    }

    query += ' ORDER BY solved_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(query).all(...params);
    return rows.map(mapProgress);
}

/**
 * Count entries.
 */
function countByUserId(userId, operation = null) {
    let query = 'SELECT COUNT(*) as count FROM progress WHERE user_id = ?';
    const params = [userId];

    if (operation) {
        query += ' AND operation = ?';
        params.push(operation);
    }

    const row = db.prepare(query).get(...params);
    return row.count;
}

/**
 * Get Breakdown.
 */
function getOperationBreakdown(userId) {
    return db.prepare(`
        SELECT operation, COUNT(*) as count 
        FROM progress 
        WHERE user_id = ? 
        GROUP BY operation
    `).all(userId);
}

/**
 * Get Distinct Days.
 */
function getDistinctDays(userId) {
    const rows = db.prepare(`
        SELECT DISTINCT date(solved_at) as day 
        FROM progress 
        WHERE user_id = ? 
        ORDER BY day DESC
    `).all(userId);
    return rows.map(r => r.day);
}

/**
 * Clear user history.
 */
function deleteByUserId(userId) {
    const info = db.prepare('DELETE FROM progress WHERE user_id = ?').run(userId);
    return info.changes;
}

/**
 * Cleanup: Maintain 500 entries per user limit.
 */
function pruneUserProgress(userId, limit = 500) {
    db.prepare(`
        DELETE FROM progress 
        WHERE progress_id IN (
            SELECT progress_id FROM progress 
            WHERE user_id = ? 
            ORDER BY solved_at DESC 
            LIMIT -1 OFFSET ?
        )
    `).run(userId, limit);
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
