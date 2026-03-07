/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Pure business logic for authentication.
 *          Handles password hashing, token generation, and verification.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'gs_fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Hashes a plain text password.
 * @param {string} plainPassword 
 * @returns {Promise<string>}
 */
async function hashPassword(plainPassword) {
    return await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

/**
 * Verifies a plain text password against a hash.
 * @param {string} plainPassword 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plainPassword, hash) {
    return await bcrypt.compare(plainPassword, hash);
}

/**
 * Generates a signed JWT token.
 * @param {Object} payload { userId, email, role }
 * @returns {string}
 */
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifies a JWT token.
 * @param {string} token 
 * @returns {Object} { userId, email, role }
 */
function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

/**
 * Generates a unique user ID.
 * @returns {string} uuid v4
 */
function generateUserId() {
    return uuidv4();
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    generateUserId
};
