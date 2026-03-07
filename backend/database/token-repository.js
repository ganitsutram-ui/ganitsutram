/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: Database operations for password reset tokens.
*/

const db = require('./db');
const { v4: uuidv4 } = require('uuid');

/**
 * Creates a new reset token in the database.
 */
function createResetToken({ tokenId, userId, tokenHash, expiresAt, createdAt }) {
    const stmt = db.prepare(`
        INSERT INTO reset_tokens (token_id, user_id, token_hash, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(tokenId, userId, tokenHash, expiresAt, createdAt);

    return db.prepare('SELECT * FROM reset_tokens WHERE token_id = ?').get(tokenId);
}

/**
 * Finds a token by its hash.
 */
function findByTokenHash(tokenHash) {
    const stmt = db.prepare('SELECT * FROM reset_tokens WHERE token_hash = ?');
    return stmt.get(tokenHash);
}

/**
 * Marks a token as used.
 */
function markTokenUsed(tokenId) {
    const stmt = db.prepare('UPDATE reset_tokens SET used = 1 WHERE token_id = ?');
    stmt.run(tokenId);
    return db.prepare('SELECT * FROM reset_tokens WHERE token_id = ?').get(tokenId);
}

/**
 * Deletes tokens that have expired and have not been used.
 * Returns the number of deleted tokens.
 */
function deleteExpiredTokens() {
    const now = new Date().toISOString();
    const stmt = db.prepare('DELETE FROM reset_tokens WHERE expires_at < ? AND used = 0');
    const result = stmt.run(now);
    return result.changes;
}

/**
 * Deletes all reset tokens associated with a given user.
 */
function deleteUserTokens(userId) {
    const stmt = db.prepare('DELETE FROM reset_tokens WHERE user_id = ?');
    const result = stmt.run(userId);
    return result.changes;
}

module.exports = {
    createResetToken,
    findByTokenHash,
    markTokenUsed,
    deleteExpiredTokens,
    deleteUserTokens
};
