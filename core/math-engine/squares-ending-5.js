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
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: Core math-engine module for Squares Ending in 5.
         Vedic Sutra: Ekadhikena Purvena (By one more than the previous).
         RULE: Pure logic only. No DOM, no HTTP, no side-effects.
*/

'use strict';

/**
 * Module: Squares Ending in 5
 *
 * Description:
 *   Calculates the square of any positive integer ending in 5 using the 
 *   Ekadhikena Purvena sutra. The logic splits the number into N and 5,
 *   computes N * (N + 1), and appends 25 to the result.
 */

// ─── HELPERS ─────────────────────────────────────────────────

/**
 * Validate that the input is a positive integer ending in 5.
 * @param {number|string} input
 * @throws {Error} If invalid
 * @returns {number} The validated number
 */
function validate(input) {
    const num = Number(input);
    if (!Number.isInteger(num) || num <= 0) {
        throw new Error(`[SquaresEnding5] Invalid input: "${input}". Must be a positive integer.`);
    }
    if (num % 10 !== 5) {
        throw new Error(`[SquaresEnding5] Invalid input: "${input}". Number must end in 5.`);
    }
    return num;
}

// ─── MAIN ALGORITHM ──────────────────────────────────────────

/**
 * squaresEndingFive - Computes the square of a number ending in 5.
 *
 * @param {number} n - Positive integer ending in 5
 * @returns {number} - The square of the number
 *
 * @example
 * squaresEndingFive(25) // => 625
 */
function squaresEndingFive(n) {
    const num = validate(n);
    const prev = Math.floor(num / 10); // N
    const product = prev * (prev + 1); // N * (N + 1)

    // Result is product followed by 25
    // Mathematically: product * 100 + 25
    return product * 100 + 25;
}

/**
 * squaresEndingFiveWithSteps - Computes the square with step-by-step breakdown.
 *
 * @param {number} n - Positive integer ending in 5
 * @returns {Object} - Result and steps array
 */
function squaresEndingFiveWithSteps(n) {
    const num = validate(n);
    const prev = Math.floor(num / 10);
    const nextVal = prev + 1;
    const finalPrev = prev * nextVal;
    const result = finalPrev * 100 + 25;

    return {
        result,
        steps: [
            `Input number: ${num}`,
            `Identify the part before 5: ${prev}`,
            `Apply Ekadhikena Purvena (One more than previous): ${prev} + 1 = ${nextVal}`,
            `Multiply these parts: ${prev} × ${nextVal} = ${finalPrev}`,
            `Append 25 to the product: ${finalPrev}25`,
            `Final Result: ${result}`
        ]
    };
}

// ─── EXPORTS ─────────────────────────────────────────────────
module.exports = {
    squaresEndingFive,
    squaresEndingFiveWithSteps
};
