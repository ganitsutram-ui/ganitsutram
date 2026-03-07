/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: Detect and analyse recurring mathematical and Vedic patterns.
         The intelligence layer of GanitSūtram.
*/

'use strict';

// ─── VALIDATION UTILITIES ────────────────────────────────────

/**
 * Validates an array of positive integers.
 * @param {Array} arr - Array to validate
 * @param {number} minLen - Minimum length
 * @param {number} maxLen - Maximum length
 * @throws {Error} If validation fails
 */
function validateNumberArray(arr, minLen = 1, maxLen = 100) {
    if (!Array.isArray(arr)) {
        throw new Error("Input must be an array.");
    }
    if (arr.length < minLen || arr.length > maxLen) {
        throw new Error(`Array length must be between ${minLen} and ${maxLen}.`);
    }
    arr.forEach(n => {
        if (!Number.isInteger(n) || n < 0) {
            throw new Error(`Invalid element: ${n}. All elements must be non-negative integers.`);
        }
    });
}

/**
 * Validates a numerical range.
 * @param {number} start - Start of range
 * @param {number} end - End of range
 * @throws {Error} If validation fails
 */
function validateRange(start, end) {
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < 0) {
        throw new Error("Range values must be non-negative integers.");
    }
    if (start >= end) {
        throw new Error("Start of range must be less than end.");
    }
    if (end - start > 10000) {
        throw new Error("Range size exceeds maximum limit of 10000.");
    }
}

/**
 * Calculates the digital root of a number.
 * @param {number} n
 * @returns {number}
 */
function getDigitalRoot(n) {
    if (n === 0) return 0;
    const root = n % 9;
    return root === 0 ? 9 : root;
}

/**
 * Calculates the digit sum of a number (single pass).
 * @param {number} n
 * @returns {number}
 */
function getDigitSum(n) {
    return String(n).split('').reduce((sum, d) => sum + parseInt(d), 0);
}

// ─── PATTERN DETECTORS ───────────────────────────────────────

/**
 * Maps digital roots across a number range.
 * @param {number} start
 * @param {number} end
 * @returns {Object}
 */
function detectDigitalRootCycle(start, end) {
    validateRange(start, end);
    const roots = [];
    for (let n = start; n <= end; n++) {
        roots.push({ n, root: getDigitalRoot(n) });
    }

    return {
        range: [start, end],
        roots,
        cycleLength: 9,
        pattern: "repeating 1-9 cycle",
        cycleDetected: roots.length >= 9
    };
}

/**
 * Generates squares and analyses their digital roots.
 * @param {number} count
 * @returns {Object}
 */
function detectSquarePattern(count) {
    if (count < 1 || count > 100) throw new Error("Count must be between 1 and 100.");
    const squares = [];
    for (let n = 1; n <= count; n++) {
        const sq = n * n;
        squares.push({ n, square: sq, digitalRoot: getDigitalRoot(sq) });
    }

    return {
        squares,
        rootPattern: [1, 4, 9, 7, 7, 9, 4, 1, 9],
        patternRepeats: count >= 9,
        insight: "Perfect squares digital roots cycle: 1,4,9,7,7,9,4,1,9"
    };
}

/**
 * Analyses digit sums of an array of numbers.
 * @param {Array<number>} numbers
 * @returns {Object}
 */
function detectSumOfDigitsPattern(numbers) {
    validateNumberArray(numbers);
    const results = numbers.map(n => ({ n, digitSum: getDigitSum(n) }));

    let isArithmetic = results.length >= 3;
    let commonDifference = null;

    if (isArithmetic) {
        commonDifference = results[1].digitSum - results[0].digitSum;
        for (let i = 2; i < results.length; i++) {
            if (results[i].digitSum - results[i - 1].digitSum !== commonDifference) {
                isArithmetic = false;
                commonDifference = null;
                break;
            }
        }
    }

    return {
        results,
        isArithmetic,
        commonDifference,
        insight: isArithmetic ? `Digit sums form an arithmetic progression with difference ${commonDifference}.` : "No linear digit sum pattern detected."
    };
}

/**
 * Finds all palindromic numbers in a range.
 * @param {number} start
 * @param {number} end
 * @returns {Object}
 */
function detectPalindromePattern(start, end) {
    validateRange(start, end);
    const palindromes = [];
    for (let n = start; n <= end; n++) {
        const s = String(n);
        if (s === s.split('').reverse().join('')) {
            palindromes.push(n);
        }
    }
    const count = palindromes.length;
    const rangeSize = end - start + 1;
    const density = (count / rangeSize) * 100;

    return {
        range: [start, end],
        palindromes,
        count,
        density: parseFloat(density.toFixed(2))
    };
}

/**
 * Analyses multiples of 11.
 * @param {number} count
 * @returns {Object}
 */
function detectMultiples11Pattern(count) {
    if (count < 1 || count > 100) throw new Error("Count must be between 1 and 100.");
    const multiples = [];
    for (let n = 1; n <= count; n++) {
        const m = n * 11;
        multiples.push({
            n,
            multiple: m,
            digitalRoot: getDigitalRoot(m),
            digitSum: getDigitSum(m)
        });
    }

    return {
        multiples,
        rootPattern: multiples.map(m => m.digitalRoot),
        insight: "Multiples of 11 alternate digital roots and exhibit bridging digit sums."
    };
}

/**
 * Computes differences between consecutive perfect squares.
 * @param {number} count
 * @returns {Object}
 */
function detectConsecutiveSquareDiff(count) {
    if (count < 1 || count > 100) throw new Error("Count must be between 1 and 100.");
    const pairs = [];
    const diffs = [];
    let allOdd = true;

    for (let n = 1; n <= count; n++) {
        const sq1 = n * n;
        const sq2 = (n + 1) * (n + 1);
        const diff = sq2 - sq1;
        pairs.push({ n, sq1, sq2, diff });
        diffs.push(diff);
        if (diff % 2 === 0) allOdd = false;
    }

    return {
        pairs,
        diffs,
        allOdd,
        pattern: "Differences are consecutive odd numbers: 1,3,5,7,9...",
        insight: "Each consecutive square difference equals 2n+1"
    };
}

// ─── SEQUENCE ANALYSER ───────────────────────────────────────

/**
 * Runs various detectors on a number sequence.
 * @param {Array<number>} numbers
 * @returns {Object}
 */
function analyseSequence(numbers) {
    validateNumberArray(numbers, 3, 100);

    // AP Detection
    let commonDifference = numbers[1] - numbers[0];
    let isArithmeticProgression = true;
    for (let i = 2; i < numbers.length; i++) {
        if (numbers[i] - numbers[i - 1] !== commonDifference) {
            isArithmeticProgression = false;
            commonDifference = null;
            break;
        }
    }

    // GP Detection
    let commonRatio = numbers[0] !== 0 ? numbers[1] / numbers[0] : null;
    let isGeometricProgression = commonRatio !== null;
    if (isGeometricProgression) {
        for (let i = 2; i < numbers.length; i++) {
            if (numbers[i - 1] === 0 || numbers[i] / numbers[i - 1] !== commonRatio) {
                isGeometricProgression = false;
                commonRatio = null;
                break;
            }
        }
    }

    const digitalRoots = numbers.map(getDigitalRoot);
    const palindromeCount = numbers.filter(n => {
        const s = String(n);
        return s === s.split('').reverse().join('');
    }).length;

    const patterns = [
        { name: "Arithmetic Progression", detected: isArithmeticProgression, insight: isArithmeticProgression ? `Sequence grows by constant ${commonDifference}` : "" },
        { name: "Geometric Progression", detected: isGeometricProgression, insight: isGeometricProgression ? `Sequence grows by factor ${commonRatio}` : "" },
        { name: "Palindromes", detected: palindromeCount === numbers.length, insight: palindromeCount === numbers.length ? "All numbers are palindromic" : "" }
    ];

    let dominantPattern = patterns.find(p => p.detected)?.name || "Undetermined";

    return {
        input: numbers,
        length: numbers.length,
        isArithmeticProgression,
        commonDifference,
        isGeometricProgression,
        commonRatio,
        digitalRoots,
        digitalRootCycleDetected: digitalRoots.length >= 9,
        allPalindrome: palindromeCount === numbers.length,
        palindromeCount,
        sumOfSquares: numbers.reduce((sum, n) => sum + (n * n), 0),
        patterns,
        dominantPattern
    };
}

// ─── VEDIC PATTERN LIBRARY ───────────────────────────────────

const VEDIC_PATTERNS = [
    {
        name: "nine-complement",
        title: "Nine Complement Law",
        sutra: "निखिलं नवतश्चरमं दशतः",
        description: "Any digit + its complement from 9 = 9",
        examples: ["1+8=9", "3+6=9", "4+5=9"],
        formula: "d + (9-d) = 9"
    },
    {
        name: "digital-root-multiplication",
        title: "Digital Root Multiplication",
        sutra: "बीजांक",
        description: "Digital root of a×b = digital root of (root(a) × root(b))",
        examples: ["DR(6×8)=DR(48)=DR(6×8)=DR(DR(6)×DR(8))"],
        formula: "DR(a×b) = DR(DR(a) × DR(b))"
    },
    {
        name: "casting-out-nines",
        title: "Casting Out Nines",
        sutra: "बीजांक शोधन",
        description: "Verify arithmetic by comparing digital roots of operands and result.",
        examples: ["47+36=83 → DR(47)+DR(36)=DR(83) → 2+9=2 ✓"],
        formula: "DR(a+b) = DR(DR(a) + DR(b))"
    },
    {
        name: "square-ending-pattern",
        title: "Last Digit Square Pattern",
        sutra: "एकाधिकेन पूर्वेण",
        description: "The last digit of n² depends only on the last digit of n.",
        examples: ["n ends in 1 or 9 → n² ends in 1", "n ends in 5 → n² ends in 5"],
        formula: "lastDigit(n²) = lastDigit((lastDigit(n))²)"
    },
    {
        name: "fibonacci-digital-roots",
        title: "Fibonacci Digital Root Cycle",
        sutra: "आनुरूप्येण",
        description: "Digital roots of Fibonacci numbers repeat in a 24-step cycle.",
        examples: ["1,1,2,3,5,8,4,3,7,1,8,9,8,8,7,6,4,1,5,6,2,8,1,9 → repeats"],
        formula: "DR(Fib(n)) has period 24"
    },
    {
        name: "kaprekar-constant",
        title: "Kaprekar Constant",
        sutra: "चक्रवाल",
        description: "Any 4-digit number reaches 6174 via Kaprekar's routine.",
        examples: ["3087 → 8730-0378=8352 → 8532-2358=6174"],
        formula: "Kaprekar(n) → 6174 within 7 iterations"
    }
];

/**
 * Retrieves a Vedic pattern by name.
 * @param {string} name
 * @returns {Object|null}
 */
function getVedicPattern(name) {
    return VEDIC_PATTERNS.find(p => p.name === name) || null;
}

/**
 * Lists all available Vedic patterns.
 * @returns {Array<Object>}
 */
function listVedicPatterns() {
    return VEDIC_PATTERNS.map(p => ({
        name: p.name,
        title: p.title
    }));
}

// ─── KAPREKAR ROUTINE ────────────────────────────────────────

/**
 * Executes the Kaprekar routine on a 3 or 4 digit number.
 * @param {number} n
 * @returns {Object}
 */
function kaprekarRoutine(n) {
    const s = String(n).padStart(n > 999 ? 4 : 3, '0');
    if (s.length !== 3 && s.length !== 4) {
        throw new Error("Input must be a 3 or 4 digit number.");
    }
    if (new Set(s.split('')).size === 1) {
        throw new Error("Digits cannot be all identical.");
    }

    const constant = s.length === 4 ? 6174 : 495;
    const steps = [];
    let current = n;
    let iterations = 0;

    while (current !== constant && iterations < 10) {
        const digits = String(current).padStart(s.length, '0').split('');
        const descArr = [...digits].sort((a, b) => b - a);
        const ascArr = [...digits].sort((a, b) => a - b);

        const descNum = parseInt(descArr.join(''));
        const ascNum = parseInt(ascArr.join(''));
        const diff = descNum - ascNum;

        steps.push({ descNum, ascNum, diff });
        current = diff;
        iterations++;
    }

    if (iterations >= 9) {
        throw new Error("Convergence failure - check input constraints.");
    }

    return {
        input: n,
        constant,
        steps,
        iterationsToConstant: iterations
    };
}

// ─── FIBONACCI UTILITIES ────────────────────────────────────

/**
 * Generates first n Fibonacci numbers.
 * @param {number} n
 * @returns {Array<number>}
 */
function fibonacci(n) {
    if (n < 1 || n > 50) throw new Error("Count must be between 1 and 50.");
    const fib = [1, 1];
    if (n === 1) return [1];
    while (fib.length < n) {
        fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
    }
    return fib;
}

/**
 * Generates digital roots of first n Fibonacci numbers.
 * @param {number} n
 * @returns {Object}
 */
function fibonacciDigitalRoots(n) {
    const fibs = fibonacci(n);
    const roots = fibs.map(getDigitalRoot);
    const cycle = [1, 1, 2, 3, 5, 8, 4, 3, 7, 1, 8, 9, 8, 8, 7, 6, 4, 1, 5, 6, 2, 8, 1, 9];

    let cycleDetected = true;
    if (n < 24) {
        cycleDetected = false;
    } else {
        for (let i = 0; i < 24; i++) {
            if (roots[i] !== cycle[i]) {
                cycleDetected = false;
                break;
            }
        }
    }

    return {
        roots,
        cycleDetected,
        cycleLength: 24,
        cycle
    };
}

// ─── EXPORTS ─────────────────────────────────────────────────

module.exports = {
    detectDigitalRootCycle,
    detectSquarePattern,
    detectSumOfDigitsPattern,
    detectPalindromePattern,
    detectMultiples11Pattern,
    detectConsecutiveSquareDiff,
    analyseSequence,
    getVedicPattern,
    listVedicPatterns,
    kaprekarRoutine,
    fibonacci,
    fibonacciDigitalRoots,
    // Utilities
    validateNumberArray,
    validateRange
};
