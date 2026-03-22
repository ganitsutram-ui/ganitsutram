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
 * Gregorian: 2026-03-08
 * 
 * Purpose: Middleware for sanitising and validating request inputs.
 */

/**
 * Validates that an input is a positive integer.
 * Handles strings and numbers.
 */
function validatePositiveInteger(input) {
    if (input === undefined || input === null || input === '') {
        return { valid: false, message: "Input is required." };
    }

    const parsed = Number(input);
    if (!Number.isInteger(parsed) || parsed < 0) {
        return { valid: false, message: "Input must be a positive integer." };
    }

    return { valid: true, parsed };
}

/**
 * Validates that an input is an array of numbers.
 */
function validateNumberArray(arr, minLength = 1, maxLength = 100) {
    if (!Array.isArray(arr)) {
        return { valid: false, message: "Input must be an array." };
    }

    if (arr.length < minLength) {
        return { valid: false, message: `Array must have at least ${minLength} elements.` };
    }

    if (arr.length > maxLength) {
        return { valid: false, message: `Array exceeds maximum length of ${maxLength}.` };
    }

    const allNumbers = arr.every(n => typeof n === 'number' && !isNaN(n));
    if (!allNumbers) {
        return { valid: false, message: "All elements in the array must be valid numbers." };
    }

    return { valid: true };
}

/**
 * Validates a range for digital root cycles.
 */
function validateRange(start, end) {
    const s = validatePositiveInteger(start);
    const e = validatePositiveInteger(end);

    if (!s.valid || !e.valid) return { valid: false, message: "Start and end must be positive integers." };
    if (e.parsed <= s.parsed) return { valid: false, message: "End must be greater than start." };
    if (e.parsed - s.parsed > 1000) return { valid: false, message: "Range too large (max 1000)." };

    return { valid: true, start: s.parsed, end: e.parsed };
}

module.exports = {
    validatePositiveInteger,
    validateNumberArray,
    validateRange
};
