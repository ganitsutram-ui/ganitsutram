/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Data Access Object for Practice Attempts.
 */

const db = require('./db');

/**
 * Saves a practice attempt.
 */
async function saveAttempt(attempt) {
    await db.run(`
        INSERT INTO practice_attempts (
            attempt_id, user_id, operation, question, 
            correct_answer, user_answer, is_correct, 
            difficulty, attempted_at, time_taken_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        attempt.attemptId,
        attempt.userId || null,
        attempt.operation,
        attempt.question,
        String(attempt.correctAnswer),
        attempt.userAnswer ? String(attempt.userAnswer) : null,
        attempt.isCorrect ? 1 : 0,
        attempt.difficulty,
        attempt.attemptedAt,
        attempt.timeTakenMs || 0
    );

    return attempt;
}

/**
 * Retrieves attempts for a user.
 */
async function getAttemptsByUser(userId, { operation, difficulty, limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM practice_attempts WHERE user_id = ?';
    const params = [userId];

    if (operation && operation !== 'all') {
        query += ' AND operation = ?';
        params.push(operation);
    }
    if (difficulty) {
        query += ' AND difficulty = ?';
        params.push(difficulty);
    }

    query += ' ORDER BY attempted_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await db.all(query, ...params);
}

/**
 * Aggregates practice statistics.
 */
async function getPracticeStats(userId) {
    const overall = await db.get(`
        SELECT 
            COUNT(*) as attempted,
            SUM(is_correct) as correct
        FROM practice_attempts 
        WHERE user_id = ?
    `, userId);

    const byOperation = await db.all(`
        SELECT 
            operation,
            COUNT(*) as attempted,
            SUM(is_correct) as correct
        FROM practice_attempts 
            WHERE user_id = ?
            GROUP BY operation
    `, userId);

    const byDifficulty = await db.all(`
        SELECT 
            difficulty,
            COUNT(*) as attempted,
            SUM(is_correct) as correct
        FROM practice_attempts 
            WHERE user_id = ?
            GROUP BY difficulty
    `, userId);

    const format = (data) => ({
        ...data,
        accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0
    });

    return {
        ...format(overall),
        byOperation: byOperation.map(format),
        byDifficulty: byDifficulty.map(format)
    };
}

module.exports = {
    saveAttempt,
    getAttemptsByUser,
    getPracticeStats
};
