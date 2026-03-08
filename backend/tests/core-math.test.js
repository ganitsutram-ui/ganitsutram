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
const digitalRootModule = require('../../core/math-engine/digital-root');
const { squaresEndingFive, squaresEndingFiveWithSteps } = require('../../core/math-engine/squares-ending-5');
const { multiplyBy11, multiplyBy11WithSteps } = require('../../core/math-engine/multiply-by-11');
const { nikhilam, nikhilamWithSteps } = require('../../core/math-engine/nikhilam');
const { urdhva } = require('../../core/math-engine/urdhva');
const {
    detectDigitalRootCycle,
    detectSquarePattern,
    detectConsecutiveSquareDiff,
    kaprekarRoutine,
    fibonacci,
    fibonacciDigitalRoots,
    analyseSequence,
    listVedicPatterns
} = require('../../core/math-engine/pattern-engine');

describe('Core Math Engine Tests', () => {
    describe('Digital Root', () => {
        it('calculates digital roots correctly', () => {
            expect(digitalRootModule.digitalRoot(0)).toBe(0);
            expect(digitalRootModule.digitalRoot(9)).toBe(9);
            expect(digitalRootModule.digitalRoot(98)).toBe(8);
            expect(digitalRootModule.digitalRoot(999)).toBe(9);
            expect(digitalRootModule.digitalRoot(493)).toBe(7);
        });

        it('returns steps for digital root', () => {
            const res = digitalRootModule.digitalRootWithSteps(98);
            expect(res.steps).toEqual([98, 17, 8]);
            expect(res.result).toBe(8);
        });

        it('validates digital root inputs', () => {
            expect(() => digitalRootModule.digitalRoot(-1)).toThrow();
            expect(() => digitalRootModule.digitalRoot('abc')).toThrow();
        });
    });

    describe('Squares Ending in 5', () => {
        it('calculates squares correctly', () => {
            expect(squaresEndingFive(5)).toBe(25);
            expect(squaresEndingFive(25)).toBe(625);
            expect(squaresEndingFive(75)).toBe(5625);
            expect(squaresEndingFive(115)).toBe(13225);
            expect(squaresEndingFive(205)).toBe(42025);
        });

        it('throws for numbers not ending in 5', () => {
            expect(() => squaresEndingFive(24)).toThrow();
        });

        it('returns steps for squares ending in 5', () => {
            const res = squaresEndingFiveWithSteps(25);
            expect(res.result).toBe(625);
        });
    });

    describe('Multiply by 11', () => {
        it('calculates products correctly', () => {
            expect(multiplyBy11(36)).toBe(396);
            expect(multiplyBy11(57)).toBe(627);
            expect(multiplyBy11(123)).toBe(1353);
            expect(multiplyBy11(99)).toBe(1089);
            expect(multiplyBy11(9)).toBe(99);
        });

        it('returns steps for multiply by 11', () => {
            const res = multiplyBy11WithSteps(57);
            expect(res.result).toBe(627);
        });
    });

    describe('Nikhilam', () => {
        it('calculates nikhilam correctly', () => {
            expect(nikhilam(98, 97)).toBe(9506);
            expect(nikhilam(9, 8)).toBe(72);
            expect(nikhilam(98, 92)).toBe(9016);
            expect(nikhilam(999, 998)).toBe(997002);
        });

        it('returns steps for nikhilam', () => {
            const res = nikhilamWithSteps(98, 97);
            expect(res.result).toBe(9506);
            expect(res.base).toBe(100);
        });
    });

    describe('Urdhva Tiryakbhyam', () => {
        it('calculates urdhva correctly', () => {
            expect(urdhva(12, 13)).toBe(156);
            expect(urdhva(23, 45)).toBe(1035);
            expect(urdhva(99, 99)).toBe(9801);
            expect(urdhva(123, 456)).toBe(56088);
            expect(urdhva(11, 11)).toBe(121);
        });
    });

    describe('Pattern Engine', () => {
        it('detects digital root cycles', () => {
            const res = detectDigitalRootCycle(1, 9);
            const roots = res.roots.map(r => r.root);
            expect(roots).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

            const res2 = detectDigitalRootCycle(1, 18);
            expect(res2.cycleDetected).toBeTruthy();
        });

        it('detects square patterns', () => {
            const res = detectSquarePattern(9);
            expect(res.rootPattern).toEqual([1, 4, 9, 7, 7, 9, 4, 1, 9]);
        });

        it('detects consecutive square diffs', () => {
            const res = detectConsecutiveSquareDiff(5);
            expect(res.allOdd).toBeTruthy();
            expect(res.diffs).toEqual([3, 5, 7, 9, 11]);
        });

        it('calculates kaprekar routine', () => {
            const res = kaprekarRoutine(3087);
            expect(res.constant).toBe(6174);
            expect(res.iterationsToConstant).toBe(2);
        });

        it('generates fibonacci sequence', () => {
            expect(fibonacci(8)).toEqual([1, 1, 2, 3, 5, 8, 13, 21]);
        });

        it('detects fibonacci digital root cycles', () => {
            const res = fibonacciDigitalRoots(24);
            expect(res.cycleDetected).toBeTruthy();
        });

        it('analyses sequence progressions', () => {
            const res = analyseSequence([2, 4, 6, 8, 10]);
            expect(res.isArithmeticProgression).toBeTruthy();
            expect(res.commonDifference).toBe(2);
        });

        it('lists vedic patterns', () => {
            expect(listVedicPatterns().length).toBe(6);
        });
    });
});
