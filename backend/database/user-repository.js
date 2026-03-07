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
 * @returns {Object}
 */
function createUser({ userId, email, passwordHash, role, createdAt }) {
    const stmt = db.prepare(`
        INSERT INTO users (user_id, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(userId, email, passwordHash, role, createdAt);
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
function findByEmail(email) {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    return mapUser(row);
}

/**
 * Finds a user by ID.
 */
function findById(userId) {
    const row = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
    return mapUser(row);
}

/**
 * Checks if email already exists.
 */
function emailExists(email) {
    const row = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
    return !!row;
}

/**
 * Updates a user's password.
 */
function updatePassword(userId, passwordHash) {
    const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE user_id = ?');
    stmt.run(passwordHash, userId);
}

module.exports = {
    createUser,
    findByEmail,
    findById,
    emailExists,
    updatePassword
};
