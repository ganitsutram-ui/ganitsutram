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
 * Creator:   Jawahar R. Mallah
 * Email:     jawahar@aitdl.com
 * Websites:  https://ganitsutram.com
 *
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 */
/**
 * Project: GanitSūtram
 * File:    tests/test-runner.js
 * Purpose: Zero-dependency Jest-compatible test runner.
 *          Implements describe / it / expect / beforeAll / afterAll
 *          so that existing test files run without installing Jest.
 *
 * Usage:
 *   node tests/test-runner.js              — runs all test suites
 *   node tests/test-runner.js --suite auth — runs only auth.test.js
 *   node tests/test-runner.js --all        — same as no args
 */

'use strict';

const path = require('path');
const fs = require('fs');

// ─── ANSI colours ────────────────────────────────────────────────────────────
const C = {
    reset:  '\x1b[0m',
    green:  '\x1b[32m',
    red:    '\x1b[31m',
    yellow: '\x1b[33m',
    cyan:   '\x1b[36m',
    bold:   '\x1b[1m',
    dim:    '\x1b[2m'
};

// ─── Global state ─────────────────────────────────────────────────────────────
let suites       = [];   // { name, tests, beforeAlls, afterAlls }
let currentSuite = null;

let totalPassed  = 0;
let totalFailed  = 0;
let totalSkipped = 0;

// ─── Globals injected into test files ─────────────────────────────────────────

global.describe = function (suiteName, fn) {
    const suite = { name: suiteName, tests: [], beforeAlls: [], afterAlls: [] };
    suites.push(suite);
    const prev = currentSuite;
    currentSuite = suite;
    fn();
    currentSuite = prev;
};

global.it = global.test = function (testName, fn) {
    if (!currentSuite) {
        // top-level it() — create an implicit suite
        const implicit = suites.find(s => s.name === '__implicit__');
        if (implicit) {
            currentSuite = implicit;
        } else {
            const s = { name: '__implicit__', tests: [], beforeAlls: [], afterAlls: [] };
            suites.push(s);
            currentSuite = s;
        }
    }
    currentSuite.tests.push({ name: testName, fn });
    currentSuite = currentSuite; // keep
};

global.beforeAll = function (fn) {
    if (currentSuite) currentSuite.beforeAlls.push(fn);
};

global.afterAll = function (fn) {
    if (currentSuite) currentSuite.afterAlls.push(fn);
};

// ─── Expect implementation ────────────────────────────────────────────────────

function GanitExpect(received) {
    return {
        toBe(expected) {
            if (received !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(received)}`);
            }
        },
        toEqual(expected) {
            const r = JSON.stringify(received);
            const e = JSON.stringify(expected);
            if (r !== e) {
                throw new Error(`Expected ${e}, got ${r}`);
            }
        },
        toBeTruthy() {
            if (!received) {
                throw new Error(`Expected truthy value, got ${JSON.stringify(received)}`);
            }
        },
        toBeFalsy() {
            if (received) {
                throw new Error(`Expected falsy value, got ${JSON.stringify(received)}`);
            }
        },
        toBeGreaterThan(n) {
            if (!(received > n)) {
                throw new Error(`Expected ${received} to be greater than ${n}`);
            }
        },
        toBeGreaterThanOrEqual(n) {
            if (!(received >= n)) {
                throw new Error(`Expected ${received} to be >= ${n}`);
            }
        },
        toBeLessThan(n) {
            if (!(received < n)) {
                throw new Error(`Expected ${received} to be less than ${n}`);
            }
        },
        toContain(item) {
            if (!Array.isArray(received) ? !received.includes(item) : !received.includes(item)) {
                throw new Error(`Expected array/string to contain ${JSON.stringify(item)}`);
            }
        },
        toBeNull() {
            if (received !== null) {
                throw new Error(`Expected null, got ${JSON.stringify(received)}`);
            }
        },
        toBeUndefined() {
            if (received !== undefined) {
                throw new Error(`Expected undefined, got ${JSON.stringify(received)}`);
            }
        },
        toThrow() {
            if (typeof received !== 'function') {
                throw new Error('toThrow() must be called with a function wrapped in expect()');
            }
            try {
                received();
                throw new Error('Expected function to throw, but it did not');
            } catch (e) {
                if (e.message === 'Expected function to throw, but it did not') throw e;
                // thrown as expected — pass
            }
        },
        not: {
            toBe(expected) {
                if (received === expected) {
                    throw new Error(`Expected NOT ${JSON.stringify(expected)}, but got it`);
                }
            },
            toEqual(expected) {
                if (JSON.stringify(received) === JSON.stringify(expected)) {
                    throw new Error(`Expected NOT to equal ${JSON.stringify(expected)}`);
                }
            },
            toBeTruthy() {
                if (received) {
                    throw new Error(`Expected falsy, got ${JSON.stringify(received)}`);
                }
            }
        }
    };
}

global.expect = GanitExpect;

// ─── Runner ───────────────────────────────────────────────────────────────────

async function runSuite(suite) {
    console.log(`\n${C.bold}${C.cyan}  ▶ ${suite.name}${C.reset}`);
    let passed = 0, failed = 0;

    for (const hook of suite.beforeAlls) {
        try { await hook(); } catch (e) {
            console.log(`${C.red}  ✖ beforeAll failed: ${e.message}${C.reset}`);
            return { passed: 0, failed: suite.tests.length };
        }
    }

    for (const test of suite.tests) {
        try {
            await test.fn();
            console.log(`${C.green}    ✓ ${C.reset}${C.dim}${test.name}${C.reset}`);
            passed++;
        } catch (e) {
            console.log(`${C.red}    ✗ ${test.name}${C.reset}`);
            console.log(`${C.red}      → ${e.message}${C.reset}`);
            failed++;
        }
    }

    for (const hook of suite.afterAlls) {
        try { await hook(); } catch (e) {
            console.log(`${C.yellow}  ⚠ afterAll failed: ${e.message}${C.reset}`);
        }
    }

    return { passed, failed };
}

async function main() {
    const args    = process.argv.slice(2);
    const suiteArg = args.includes('--suite') ? args[args.indexOf('--suite') + 1] : null;

    const testDir = path.join(__dirname, '../tests');
    const allFiles = fs.readdirSync(testDir)
        .filter(f => f.endsWith('.test.js'))
        .sort();

    const filesToRun = suiteArg
        ? allFiles.filter(f => f.startsWith(suiteArg))
        : allFiles;

    if (filesToRun.length === 0) {
        console.log(`${C.yellow}No test files found matching "${suiteArg}"${C.reset}`);
        process.exit(1);
    }

    console.log(`\n${C.bold}GanitSūtram Test Suite${C.reset}`);
    console.log(`${C.dim}Running ${filesToRun.length} test file(s)...${C.reset}\n`);

    const start = Date.now();

    for (const file of filesToRun) {
        suites = [];
        currentSuite = null;
        console.log(`${C.bold}${file}${C.reset}`);
        try {
            require(path.join(testDir, file));
        } catch (e) {
            console.log(`${C.red}  Failed to load ${file}: ${e.message}${C.reset}`);
            totalFailed++;
            continue;
        }

        for (const suite of suites) {
            const { passed, failed } = await runSuite(suite);
            totalPassed  += passed;
            totalFailed  += failed;
        }
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    console.log(`\n${C.bold}────────────────────────────────────────${C.reset}`);
    console.log(`${C.green}  Passed:  ${totalPassed}${C.reset}`);
    if (totalFailed > 0)  console.log(`${C.red}  Failed:  ${totalFailed}${C.reset}`);
    if (totalSkipped > 0) console.log(`${C.yellow}  Skipped: ${totalSkipped}${C.reset}`);
    console.log(`${C.dim}  Time:    ${elapsed}s${C.reset}`);
    console.log(`${C.bold}────────────────────────────────────────${C.reset}\n`);

    process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error(`${C.red}Test runner crashed: ${err.message}${C.reset}`);
    process.exit(1);
});
