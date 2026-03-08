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

Purpose: Core math-engine module for Digital Root (Beejank).
         RULE: Pure logic only. No DOM, no HTTP, no side-effects.
*/

'use strict';

/**
 * Module: Digital Root (Beejank)
 *
 * Description:
 *   The digital root (also beejank) of a non-negative integer is the value 
 *   obtained by an iterative process of summing digits, until a single-digit 
 *   number is reached.
 *
 * Based on:
 *   Vedic Mathematics - Beejank (Digit Sum)
 *
 * RULES:
 * - This module contains ONLY mathematical logic.
 * - CommonJS exports for backend compatibility.
 */

// ─── HELPERS ─────────────────────────────────────────────────

/**
 * Validate that the input is a non-negative integer.
 * @param {number|string} input
 * @throws {Error} If invalid
 */
function validate(input) {
    if (input === null || input === undefined || input === '') {
        throw new Error(`[DigitalRoot] Invalid input. Input cannot be empty.`);
    }

    const str = String(input).trim();

    // Check if it's a valid integer (including 0)
    if (!/^\d+$/.test(str)) {
        throw new Error(`[DigitalRoot] Invalid input: "${input}". Must be a non-negative integer.`);
    }

    return str;
}

/**
 * Sums the digits of a number once.
 * @param {number|string} n 
 * @returns {number}
 */
function sumDigits(n) {
    return String(n)
        .split('')
        .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
}

// ─── MAIN ALGORITHM ──────────────────────────────────────────

/**
 * digitalRoot - Returns the single digit digital root of a number.
 * Uses the congruence formula shortcut: 1 + ((n - 1) % 9)
 *
 * @param {number|string} n - Input non-negative integer
 * @returns {number} - The single digit result
 *
 * @example
 * digitalRoot(98) // => 8
 */
function digitalRoot(n) {
    validate(n);

    const num = parseInt(n, 10);

    if (num === 0) return 0;

    // Shortcut formula: 1 + ((n - 1) % 9)
    // This correctly handles 9 -> 1 + (8 % 9) = 9
    return 1 + ((num - 1) % 9);
}

/**
 * digitalRootWithSteps - Returns the digital root and the steps taken to reach it.
 *
 * @param {number|string} n - Input non-negative integer
 * @returns {Object} - { result, steps }
 *
 * @example
 * digitalRootWithSteps(98) // => { result: 8, steps: [98, 17, 8] }
 */
function digitalRootWithSteps(n) {
    validate(n);

    let current = parseInt(n, 10);
    const steps = [current];

    while (current >= 10) {
        current = sumDigits(current);
        steps.push(current);
    }

    return {
        result: current,
        steps: steps
    };
}

// ─── EXPORTS ─────────────────────────────────────────────────
module.exports = {
    digitalRoot,
    digitalRootWithSteps
};
