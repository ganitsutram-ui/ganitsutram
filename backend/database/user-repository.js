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
        INSERT INTO users (user_id, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?)
    `, userId, email, passwordHash, role, createdAt);
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

module.exports = {
    createUser,
    findByEmail,
    findById,
    emailExists,
    updatePassword
};
