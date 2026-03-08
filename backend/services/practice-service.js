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
 * Purpose: Question selection and generation logic for practice mode.
 */

// Import math engines
const dr = require('../../core/math-engine/digital-root');
const sq5 = require('../../core/math-engine/squares-ending-5');
const m11 = require('../../core/math-engine/multiply-by-11');
const nik = require('../../core/math-engine/nikhilam');
const urd = require('../../core/math-engine/urdhva');

const practiceRepository = require('../database/practice-repository');
const { v4: uuidv4 } = require('uuid');

/**
 * Helper: Random number in range.
 */
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generators
const generators = {
    'digital-root': (difficulty) => {
        let n;
        if (difficulty === 'beginner') n = rand(10, 99);
        else if (difficulty === 'intermediate') n = rand(100, 9999);
        else n = rand(10000, 99999999);

        const ans = dr.digitalRoot(n);
        return {
            question: `What is the Digital Root (Beejank) of ${n}?`,
            correctAnswer: String(ans),
            operation: 'digital-root',
            difficulty,
            hint: "Sum the digits repeatedly until a single digit remains."
        };
    },

    'squares-ending-5': (difficulty) => {
        let n;
        if (difficulty === 'beginner') {
            const pool = [5, 15, 25, 35, 45];
            n = pool[rand(0, pool.length - 1)];
        } else if (difficulty === 'intermediate') {
            n = (rand(6, 15) * 10) + 5; // 65, 75... 155
        } else {
            n = (rand(20, 99) * 10) + 5; // 205... 995
        }

        const ans = sq5.squaresEndingFive(n);
        return {
            question: `Calculate the square of ${n} using Ekadhikena Purvena.`,
            correctAnswer: String(ans),
            operation: 'squares-ending-5',
            difficulty,
            hint: "Multiply the part before 5 by itself plus one, then append 25."
        };
    },

    'multiply-by-11': (difficulty) => {
        let n;
        if (difficulty === 'beginner') n = rand(11, 99);
        else if (difficulty === 'intermediate') n = rand(100, 999);
        else n = rand(1000, 9999);

        const ans = m11.multiplyBy11(n);
        return {
            question: `Multiply ${n} by 11 using the 'Sandwich' method.`,
            correctAnswer: String(ans),
            operation: 'multiply-by-11',
            difficulty,
            hint: "Keep the ends same, add adjacent digits for middle parts."
        };
    },

    'nikhilam': (difficulty) => {
        let a, b;
        if (difficulty === 'beginner') { a = rand(7, 9); b = rand(7, 9); }
        else if (difficulty === 'intermediate') { a = rand(90, 99); b = rand(90, 99); }
        else { a = rand(980, 999); b = rand(980, 999); }

        const ans = nik.nikhilam(a, b);
        return {
            question: `Multiply ${a} by ${b} using Nikhilam Navatashcaramam Dashatah.`,
            correctAnswer: String(ans),
            operation: 'nikhilam',
            difficulty,
            hint: "Subtract from the nearest base (10, 100, 1000) and follow the cross-subtraction rule."
        };
    },

    'urdhva': (difficulty) => {
        let a, b;
        if (difficulty === 'beginner') { a = rand(1, 9); b = rand(1, 9); }
        else if (difficulty === 'intermediate') { a = rand(10, 99); b = rand(10, 99); }
        else { a = rand(100, 999); b = rand(10, 99); }

        const ans = urd.urdhva(a, b);
        return {
            question: `Find the product of ${a} and ${b} using Urdhva Tiryagbhyam.`,
            correctAnswer: String(ans),
            operation: 'urdhva',
            difficulty,
            hint: "Multiply vertically and crosswise."
        };
    }
};

/**
 * Generates a set of practice questions.
 */
function generatePracticeSet(operation, difficulty, count = 5) {
    const questions = [];
    const ops = operation === 'all'
        ? Object.keys(generators)
        : [operation];

    for (let i = 0; i < count; i++) {
        const op = ops[rand(0, ops.length - 1)];
        const q = generators[op](difficulty);
        questions.push({
            ...q,
            questionId: uuidv4()
        });
    }
    return questions;
}

/**
 * Validates a user's answer.
 */
function checkAnswer(correctAnswer, userAnswer) {
    const isCorrect = String(correctAnswer).trim() === String(userAnswer).trim();
    return {
        isCorrect,
        correctAnswer,
        userAnswer
    };
}

/**
 * Regenerates a correct answer for verification.
 * Used when checking an answer server-side.
 */
function calculateAnswer(operation, question) {
    // Regex to extract numbers from question text
    const numbers = question.match(/\d+/g);
    if (!numbers) return null;

    if (operation === 'digital-root') {
        return String(dr.digitalRoot(parseInt(numbers[0])));
    }
    if (operation === 'squares-ending-5') {
        return String(sq5.squaresEndingFive(parseInt(numbers[0])));
    }
    if (operation === 'multiply-by-11') {
        return String(m11.multiplyBy11(parseInt(numbers[0])));
    }
    if (operation === 'nikhilam') {
        return String(nik.nikhilam(parseInt(numbers[0]), parseInt(numbers[1])));
    }
    if (operation === 'urdhva') {
        return String(urd.urdhva(parseInt(numbers[0]), parseInt(numbers[1])));
    }
    return null;
}

module.exports = {
    generatePracticeSet,
    checkAnswer,
    calculateAnswer,
    saveAttempt: async (userId, attempt) => {
        return await practiceRepository.saveAttempt({
            ...attempt,
            userId,
            attemptedAt: new Date().toISOString()
        });
    },
    getPracticeStats: async (userId) => await practiceRepository.getPracticeStats(userId)
};
