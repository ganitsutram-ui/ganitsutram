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
async function createResetToken({ tokenId, userId, tokenHash, expiresAt, createdAt }) {
    await db.run(`
        INSERT INTO reset_tokens (token_id, user_id, token_hash, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
    `, tokenId, userId, tokenHash, expiresAt, createdAt);

    return await db.get('SELECT * FROM reset_tokens WHERE token_id = ?', tokenId);
}

/**
 * Finds a token by its hash.
 */
async function findByTokenHash(tokenHash) {
    return await db.get('SELECT * FROM reset_tokens WHERE token_hash = ?', tokenHash);
}

/**
 * Marks a token as used.
 */
async function markTokenUsed(tokenId) {
    await db.run('UPDATE reset_tokens SET used = 1 WHERE token_id = ?', tokenId);
    return await db.get('SELECT * FROM reset_tokens WHERE token_id = ?', tokenId);
}

/**
 * Deletes tokens that have expired and have not been used.
 * Returns the number of deleted tokens.
 */
async function deleteExpiredTokens() {
    const now = new Date().toISOString();
    const result = await db.run('DELETE FROM reset_tokens WHERE expires_at < ? AND used = 0', now);
    return result.changes;
}

/**
 * Deletes all reset tokens associated with a given user.
 */
async function deleteUserTokens(userId) {
    const result = await db.run('DELETE FROM reset_tokens WHERE user_id = ?', userId);
    return result.changes;
}

module.exports = {
    createResetToken,
    findByTokenHash,
    markTokenUsed,
    deleteExpiredTokens,
    deleteUserTokens
};
