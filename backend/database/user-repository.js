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
 * Purpose: Data Access Object for Users table.
 */

const db = require('./db');

/**
 * Creates a new user in the database.
 * @param {Object} user 
 * @returns {Promise<Object>}
 */
async function createUser({ userId, email, passwordHash, role, createdAt }) {
    await db.run(`
        INSERT INTO users (user_id, email, password_hash, role, display_name, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, userId, email, passwordHash, role, null, null, createdAt);
    return { userId, email, role, createdAt };
}

/**
 * Helper: Map DB row to User object.
 */
function mapUser(row) {
    if (!row) return null;
    return {
        userId: row.user_id,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        createdAt: row.created_at
    };
}

/**
 * Finds a user by email.
 */
async function findByEmail(email) {
    const row = await db.get('SELECT * FROM users WHERE email = ?', email);
    return mapUser(row);
}

/**
 * Finds a user by ID.
 */
async function findById(userId) {
    const row = await db.get('SELECT * FROM users WHERE user_id = ?', userId);
    return mapUser(row);
}

/**
 * Checks if email already exists.
 */
async function emailExists(email) {
    const row = await db.get('SELECT 1 FROM users WHERE email = ?', email);
    return !!row;
}

/**
 * Updates a user's password.
 */
async function updatePassword(userId, passwordHash) {
    await db.run('UPDATE users SET password_hash = ? WHERE user_id = ?', passwordHash, userId);
}

/**
 * Updates user profile details.
 */
async function updateProfile(userId, { displayName, avatarUrl }) {
    await db.run(`
        UPDATE users 
        SET display_name = COALESCE(?, display_name), 
            avatar_url = COALESCE(?, avatar_url) 
        WHERE user_id = ?
    `, displayName, avatarUrl, userId);
}

module.exports = {
    createUser,
    findByEmail,
    findById,
    emailExists,
    updatePassword,
    updateProfile
};
