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

Purpose: Core math-engine module for Urdhva Tiryak multiplication.
         Vedic Sutra: Urdhva Tiryagbhyam (Vertically and Crosswise).
         RULE: Pure logic only. No DOM, no HTTP, no side-effects.
*/

'use strict';

/**
 * Module: Urdhva Multiplication
 *
 * Description:
 *   The universal Vedic multiplication method "Vertically and Crosswise".
 *   It applies to any two numbers by processing digit columns systematically
 *   and handling carries across steps.
 */

// ─── HELPERS ─────────────────────────────────────────────────

/**
 * Validate that the inputs are positive integers.
 * @param {number|string} a
 * @param {number|string} b
 * @throws {Error} If invalid
 * @returns {Object} { a: number, b: number }
 */
function validate(a, b) {
    const numA = Number(a);
    const numB = Number(b);

    if (!Number.isInteger(numA) || numA <= 0 || !Number.isInteger(numB) || numB <= 0) {
        throw new Error(`[Urdhva] Invalid input: "${a}" and "${b}". Both must be positive integers.`);
    }

    return { a: numA, b: numB };
}

// ─── MAIN ALGORITHM ──────────────────────────────────────────

/**
 * urdhva - General multiplication for any two numbers using Urdhva Tiryak.
 *
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - The result of a * b
 */
function urdhva(a, b) {
    const { a: valA, b: valB } = validate(a, b);

    const digitsA = String(valA).split('').map(Number);
    const digitsB = String(valB).split('').map(Number);

    // Pad shorter number with leading zeros
    const maxLen = Math.max(digitsA.length, digitsB.length);
    while (digitsA.length < maxLen) digitsA.unshift(0);
    while (digitsB.length < maxLen) digitsB.unshift(0);

    const n = maxLen;
    const numSteps = 2 * n - 1;
    let products = new Array(numSteps).fill(0);

    // Calculate vertical and crosswise products for each step (column)
    // Step index i goes from 0 to (2n - 2)
    for (let step = 0; step < numSteps; step++) {
        // Find indices j, k such that j + k = step
        // where j and k are digit indices from the right (0-indexed)
        // Reverse arrays for easier right-to-left processing
        const revA = [...digitsA].reverse();
        const revB = [...digitsB].reverse();

        for (let j = 0; j <= step; j++) {
            let k = step - j;
            if (j < n && k < n) {
                products[step] += revA[j] * revB[k];
            }
        }
    }

    // Process carries from right to left
    let resultDigits = [];
    let carry = 0;
    for (let i = 0; i < products.length; i++) {
        let val = products[i] + carry;
        resultDigits.push(val % 10);
        carry = Math.floor(val / 10);
    }
    if (carry > 0) {
        // Carry might be multiple digits
        String(carry).split('').reverse().forEach(d => resultDigits.push(Number(d)));
    }

    return Number(resultDigits.reverse().join(''));
}

/**
 * urdhvaWithSteps - Multiplies with step-by-step breakdown.
 *
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {Object} - Result and steps array
 */
function urdhvaWithSteps(a, b) {
    const { a: valA, b: valB } = validate(a, b);
    const result = urdhva(valA, valB);

    const digitsA = String(valA).split('').map(Number);
    const digitsB = String(valB).split('').map(Number);
    const maxLen = Math.max(digitsA.length, digitsB.length);
    while (digitsA.length < maxLen) digitsA.unshift(0);
    while (digitsB.length < maxLen) digitsB.unshift(0);

    const steps = [
        `Inputs: ${valA}, ${valB}`,
        `Aligned operands:`,
        `  ${digitsA.join('')}`,
        `  ${digitsB.join('')}`,
        `Calculating column-wise products (right to left):`
    ];

    const revA = [...digitsA].reverse();
    const revB = [...digitsB].reverse();
    const numSteps = 2 * maxLen - 1;
    let products = [];
    let carry = 0;

    for (let step = 0; step < numSteps; step++) {
        let currentProducts = [];
        let sum = 0;
        for (let j = 0; j <= step; j++) {
            let k = step - j;
            if (j < maxLen && k < maxLen) {
                currentProducts.push(`${revA[j]}×${revB[k]}`);
                sum += revA[j] * revB[k];
            }
        }
        products.push(sum);
        steps.push(`  Step ${step + 1}: ${currentProducts.join(' + ')} = ${sum}`);
    }

    steps.push(`Processing carries:`);
    let finalDigits = [];
    let currentCarry = 0;
    for (let i = 0; i < products.length; i++) {
        let val = products[i] + currentCarry;
        let digit = val % 10;
        let oldCarry = currentCarry;
        currentCarry = Math.floor(val / 10);
        steps.push(`  Pos ${i + 1}: ${products[i]}${oldCarry > 0 ? ` + carry(${oldCarry})` : ''} = ${val}. Write ${digit}, new carry ${currentCarry}`);
        finalDigits.push(digit);
    }

    if (currentCarry > 0) {
        steps.push(`  Final carry: ${currentCarry}`);
    }

    steps.push(`Final Result: ${result}`);

    return { result, steps };
}

// ─── EXPORTS ─────────────────────────────────────────────────
module.exports = {
    urdhva,
    urdhvaWithSteps
};
