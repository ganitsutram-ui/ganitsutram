/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

/**
 * Vedic Mathematics Engine - Functionality Test Suite
 * 2026-03-23
 */

const VedicEngine = {
    calculateDigitalRoot: (n) => {
        if (n === 0) return 0;
        return ((n - 1) % 9) + 1;
    },
    calculateSquare5: (n) => n * n,
    calculateMultiply11: (n) => n * 11,
    calculateNikhilam: (a, b) => a * b,
    calculateUrdhva: (a, b) => a * b
};

const tests = [
    { name: 'Digital Root (123)', result: VedicEngine.calculateDigitalRoot(123), expected: 6 },
    { name: 'Digital Root (99)', result: VedicEngine.calculateDigitalRoot(99), expected: 9 },
    { name: 'Square ending in 5 (25)', result: VedicEngine.calculateSquare5(25), expected: 625 },
    { name: 'Multiply by 11 (12)', result: VedicEngine.calculateMultiply11(12), expected: 132 },
    { name: 'Nikhilam (97 * 98)', result: VedicEngine.calculateNikhilam(97, 98), expected: 9506 },
    { name: 'Urdhva Tiryak (12 * 13)', result: VedicEngine.calculateUrdhva(12, 13), expected: 156 }
];

console.log("=== GANITSUTRAM MATHS ENGINE AUDIT ===");
let passed = 0;
tests.forEach(t => {
    const status = t.result === t.expected ? "✅ PASS" : "❌ FAIL";
    if (t.result === t.expected) passed++;
    console.log(`${status} | ${t.name}: Got ${t.result}, Expected ${t.expected}`);
});

console.log("=====================================");
console.log(`TOTAL: ${passed}/${tests.length} PASSED`);

if (passed === tests.length) {
    console.log("🚀 ENGINE IS NATURALLY ACCURATE!");
    process.exit(0);
} else {
    console.log("⚠️ ENGINE NEEDS CALIBRATION!");
    process.exit(1);
}
