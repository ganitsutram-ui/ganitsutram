/*
Project: GanitSūtram
Test Script: pattern-engine.test.js
Usage: node pattern-engine.test.js
*/

const engine = require('./core/math-engine/pattern-engine');

function test(name, fn) {
    try {
        fn();
        console.log(`✅ PASS: ${name}`);
    } catch (e) {
        console.log(`❌ FAIL: ${name}`);
        console.error(e);
        process.exit(1);
    }
}

console.log("Starting Pattern Engine Verification...\n");

test("Digital Root Cycle (1-18)", () => {
    const res = engine.detectDigitalRootCycle(1, 18);
    const roots = res.roots.map(r => r.root);
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    if (JSON.stringify(roots) !== JSON.stringify(expected)) throw new Error("Root cycle mismatch");
    if (!res.cycleDetected) throw new Error("Cycle should be detected");
});

test("Square Pattern Roots (1-9)", () => {
    const res = engine.detectSquarePattern(9);
    const roots = res.squares.map(s => s.digitalRoot);
    const expected = [1, 4, 9, 7, 7, 9, 4, 1, 9];
    if (JSON.stringify(roots) !== JSON.stringify(expected)) throw new Error("Square root pattern mismatch");
});

test("Consecutive Square Differences", () => {
    const res = engine.detectConsecutiveSquareDiff(5);
    if (!res.allOdd) throw new Error("Differences should all be odd");
    const expectedDiffs = [3, 5, 7, 9, 11];
    if (JSON.stringify(res.diffs) !== JSON.stringify(expectedDiffs)) throw new Error("Differences mismatch");
});

test("Kaprekar Routine (3087)", () => {
    const res = engine.kaprekarRoutine(3087);
    if (res.constant !== 6174) throw new Error("Wrong constant");
    if (res.iterationsToConstant !== 2) throw new Error("Wrong iteration count");
});

test("Fibonacci (8)", () => {
    const res = engine.fibonacci(8);
    const expected = [1, 1, 2, 3, 5, 8, 13, 21];
    if (JSON.stringify(res) !== JSON.stringify(expected)) throw new Error("Fibonacci mismatch");
});

test("Fibonacci Digital Roots Cycle (24)", () => {
    const res = engine.fibonacciDigitalRoots(24);
    if (!res.cycleDetected) throw new Error("24-step cycle should be detected");
});

test("Sequence Analysis (Arithmetic)", () => {
    const res = engine.analyseSequence([2, 4, 6, 8, 10]);
    if (!res.isArithmeticProgression) throw new Error("AP not detected");
    if (res.commonDifference !== 2) throw new Error("Wrong common difference");
});

test("Vedic Patterns List", () => {
    const list = engine.listVedicPatterns();
    if (list.length !== 6) throw new Error(`Expected 6 patterns, got ${list.length}`);
});

console.log("\nAll Pattern Engine tests passed! 🚀");
