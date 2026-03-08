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

Purpose: Core math-engine module for Multiplication by 11.
         RULE: Pure logic only. No DOM, no HTTP, no side-effects.
*/

'use strict';

/**
 * Module: Multiply by 11
 *
 * Description:
 *   Calculates the product of any positive integer and 11 using the 
 *   digit bridging technique. The first and last digits remain outer digits,
 *   while middle digits are formed by adding adjacent pairs and handling carries.
 */

// ─── HELPERS ─────────────────────────────────────────────────

/**
 * Validate that the input is a positive integer.
 * @param {number|string} input
 * @throws {Error} If invalid
 * @returns {number} The validated number
 */
function validate(input) {
    const num = Number(input);
    if (!Number.isInteger(num) || num <= 0) {
        throw new Error(`[MultiplyBy11] Invalid input: "${input}". Must be a positive integer.`);
    }
    return num;
}

// ─── MAIN ALGORITHM ──────────────────────────────────────────

/**
 * multiplyBy11 - Multiplies a number by 11 using digit bridging.
 *
 * @param {number} n - Positive integer
 * @returns {number} - The result of n * 11
 *
 * @example
 * multiplyBy11(36) // => 396
 */
function multiplyBy11(n) {
    validate(n);
    const digits = String(n).split('').map(Number);

    if (digits.length === 1) return n * 11;

    let resultDigits = [];
    let carry = 0;

    // Last digit stays the same
    resultDigits.push(digits[digits.length - 1]);

    // Add adjacent digits (from right to left)
    for (let i = digits.length - 1; i > 0; i--) {
        let sum = digits[i] + digits[i - 1] + carry;
        resultDigits.push(sum % 10);
        carry = Math.floor(sum / 10);
    }

    // First digit + any remaining carry
    resultDigits.push(digits[0] + carry);

    // Join and convert back to number
    return Number(resultDigits.reverse().join(''));
}

/**
 * multiplyBy11WithSteps - Multiplies a number by 11 with step-by-step breakdown.
 *
 * @param {number} n - Positive integer
 * @returns {Object} - Result and steps array
 */
function multiplyBy11WithSteps(n) {
    const num = validate(n);
    const digits = String(num).split('').map(Number);
    const result = multiplyBy11(num);

    if (digits.length === 1) {
        return {
            result,
            steps: [
                `Input number: ${num}`,
                `Single digit multiplication: ${num} × 11 = ${result}`
            ]
        };
    }

    const steps = [`Input number: ${num}`];
    let breakdown = [];
    let carry = 0;

    // Visual step representation
    steps.push(`First digit: ${digits[0]}, Last digit: ${digits[digits.length - 1]}`);

    let intermediate = [];
    intermediate.push(digits[digits.length - 1]);

    for (let i = digits.length - 1; i > 0; i--) {
        let a = digits[i];
        let b = digits[i - 1];
        let sum = a + b + carry;
        let digit = sum % 10;

        steps.push(`Add ${b} + ${a}${carry > 0 ? ` + carry(${carry})` : ''} = ${sum}. Write ${digit}, carry ${Math.floor(sum / 10)}.`);
        carry = Math.floor(sum / 10);
    }

    steps.push(`Final digit: ${digits[0]} + carry(${carry}) = ${digits[0] + carry}`);
    steps.push(`Concatenating parts...`);
    steps.push(`Final Result: ${result}`);

    return { result, steps };
}

// ─── EXPORTS ─────────────────────────────────────────────────
module.exports = {
    multiplyBy11,
    multiplyBy11WithSteps
};
