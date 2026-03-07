/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Temporary in-memory user store.
 *          (To be replaced by database in Phase 3).
 */

const userRepository = require('../database/user-repository');

/**
 * Creates a new user in the store.
 * @param {Object} userData { email, passwordHash, role }
 * @returns {Object}
 */
function createUser({ email, passwordHash, role }) {
    const { generateUserId } = require('./auth-service');
    const userId = generateUserId();
    const createdAt = new Date().toISOString();

    return userRepository.createUser({
        userId,
        email,
        passwordHash,
        role,
        createdAt
    });
}

/**
 * Finds a user by email.
 */
function findUserByEmail(email) {
    return userRepository.findByEmail(email);
}

/**
 * Finds a user by ID.
 */
function findUserById(userId) {
    return userRepository.findById(userId);
}

/**
 * Checks if a user exists with the given email.
 */
function userExists(email) {
    return userRepository.emailExists(email);
}

// These were used for the in-memory progress store but are now moved to progress-repository
// Keeping signatures if needed by some internal utility not yet refactored.
function saveUserProgress() { /* Moved to progress-repository */ }
function fetchUserProgress() { /* Moved to progress-repository */ }
function clearUserProgress() { /* Moved to progress-repository */ }

/**
 * Updates user password
 */
function updateUserPassword(userId, passwordHash) {
    userRepository.updatePassword(userId, passwordHash);
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    userExists,
    updateUserPassword
};
