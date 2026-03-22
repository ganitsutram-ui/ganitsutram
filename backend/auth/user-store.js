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
 * Purpose: Temporary in-memory user store.
 *          (To be replaced by database in Phase 3).
 */

const userRepository = require('../database/user-repository');

/**
 * Creates a new user in the store.
 * @param {Object} userData { email, passwordHash, role }
 * @returns {Object}
 */
async function createUser({ email, passwordHash, role }) {
    const { generateUserId } = require('./auth-service');
    const userId = generateUserId();
    const createdAt = new Date().toISOString();

    return await userRepository.createUser({
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
async function findUserByEmail(email) {
    return await userRepository.findByEmail(email);
}

/**
 * Finds a user by ID.
 */
async function findUserById(userId) {
    return await userRepository.findById(userId);
}

/**
 * Checks if a user exists with the given email.
 */
async function userExists(email) {
    return await userRepository.emailExists(email);
}

// These were used for the in-memory progress store but are now moved to progress-repository
// Keeping signatures if needed by some internal utility not yet refactored.
function saveUserProgress() { /* Moved to progress-repository */ }
function fetchUserProgress() { /* Moved to progress-repository */ }
function clearUserProgress() { /* Moved to progress-repository */ }

/**
 * Updates user password
 */
async function updateUserPassword(userId, passwordHash) {
    await userRepository.updatePassword(userId, passwordHash);
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    userExists,
    updateUserPassword
};
