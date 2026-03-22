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

Purpose: Core math-engine module for Nikhilam multiplication.
         Vedic Sutra: Nikhilam Navatashcaramam Dashatah (All from 9, last from 10).
         RULE: Pure logic only. No DOM, no HTTP, no side-effects.
*/

'use strict';

/**
 * Module: Nikhilam Multiplication
 *
 * Description:
 *   Special multiplication for numbers close to a base (10, 100, 1000, etc.).
 *   It calculates the product using deviations (a - base) and (b - base).
 */

// ─── HELPERS ─────────────────────────────────────────────────

/**
 * Validate that the inputs are positive integers and within proximity to a common base.
 * @param {number|string} a
 * @param {number|string} b
 * @throws {Error} If invalid
 * @returns {Object} { a: number, b: number, base: number }
 */
function validateAndGetBase(a, b) {
    const numA = Number(a);
    const numB = Number(b);

    if (!Number.isInteger(numA) || numA <= 0 || !Number.isInteger(numB) || numB <= 0) {
        throw new Error(`[Nikhilam] Invalid input: "${a}" and "${b}". Both must be positive integers.`);
    }

    // Determine nearest power of 10 base
    const maxVal = Math.max(numA, numB);
    const magnitude = Math.ceil(Math.log10(maxVal));
    const base = Math.pow(10, magnitude || 1); // Ensure base is at least 10

    // Rule: Numbers must be within 50% of the base
    const minAllowed = base / 2;
    if (numA < minAllowed || numB < minAllowed) {
        throw new Error(`[Nikhilam] Numbers ${numA}, ${numB} are not sufficiently close to base ${base}. Use Urdhva instead.`);
    }

    return { a: numA, b: numB, base };
}

// ─── MAIN ALGORITHM ──────────────────────────────────────────

/**
 * nikhilam - Multiplies two numbers using Nikhilam sutra.
 *
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - The result of a * b
 */
function nikhilam(a, b) {
    const { a: valA, b: valB, base } = validateAndGetBase(a, b);

    const da = valA - base;
    const db = valB - base;

    const leftPart = valA + db;
    const rightPart = da * db;

    // Result calculation
    // Note: rightPart can be larger than base digits if deviations are positive,
    // but the algebraic formula (a+db)*base + da*db always holds for nikhilam.
    return leftPart * base + rightPart;
}

/**
 * nikhilamWithSteps - Multiplies with step-by-step breakdown.
 *
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {Object} - Result and detailed metadata
 */
function nikhilamWithSteps(a, b) {
    const { a: valA, b: valB, base } = validateAndGetBase(a, b);

    const da = valA - base;
    const db = valB - base;

    const leftPart = valA + db;
    const rightPart = da * db;
    const result = leftPart * base + rightPart;

    const steps = [
        `Inputs: ${valA}, ${valB}`,
        `Find working base: nearest power of 10 is ${base}`,
        `Calculate deviations:`,
        `  da = ${valA} - ${base} = ${da}`,
        `  db = ${valB} - ${base} = ${db}`,
        `Calculation Parts:`,
        `  Left Part (a + db): ${valA} + (${db}) = ${leftPart}`,
        `  Right Part (da × db): ${da} × ${db} = ${rightPart}`,
        `Constructing result:`,
        `  (${leftPart} × ${base}) + ${rightPart} = ${result}`,
        `Final Result: ${result}`
    ];

    return {
        result,
        base,
        da,
        db,
        left: leftPart,
        right: rightPart,
        steps
    };
}

// ─── EXPORTS ─────────────────────────────────────────────────
module.exports = {
    nikhilam,
    nikhilamWithSteps
};
