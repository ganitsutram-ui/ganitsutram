/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

/*
GanitSūtram — Ecosystem Upgrade Verification
Tests:
  1. Discoveries: new pattern seeds appear
  2. Concepts: pattern operations present
  3. Vedic patterns API: 6 known patterns
  4. Portal stats: valid counts
  5. Solver: kaprekar, fibonacci, sequence operations
*/

async function test(name, url, method, body, check) {
    try {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        const data = await res.json();
        if (!res.ok) { console.error(`❌ ${name}: HTTP ${res.status}`); return; }
        const pass = check(data);
        console.log(pass ? `✅ ${name}` : `❌ ${name} — check failed`);
        if (!pass) { console.error('Data:', JSON.stringify(data).slice(0, 200)); }
    } catch (e) { console.error(`❌ ${name} — ERROR: ${e.message}`); }
}

const B = 'http://localhost:3000/api';

async function run() {
    console.log('Ecosystem Upgrade Verification\n');

    // 1. Discoveries: should include 8 entries including pattern category
    await test('Discoveries → 8 entries',
        `${B}/discoveries`, 'GET', null,
        d => d.discoveries && d.discoveries.length >= 8);

    // 2. Discoveries: kaprekar-constant exists
    await test('Discoveries → kaprekar-constant exists',
        `${B}/discoveries/kaprekar-constant`, 'GET', null,
        d => d.discovery && d.discovery.category === 'pattern');

    // 3. Discoveries: fibonacci-digital-roots exists
    await test('Discoveries → fibonacci-digital-roots exists',
        `${B}/discoveries/fibonacci-digital-roots`, 'GET', null,
        d => d.discovery && d.discovery.category === 'pattern');

    // 4. Concepts: pattern operations present
    await test('Concepts → 9 entries (5 + 4 new)',
        `${B}/concepts`, 'GET', null,
        d => Array.isArray(d) && d.length >= 9);

    await test('Concepts → analyse-sequence present',
        `${B}/concepts`, 'GET', null,
        d => Array.isArray(d) && d.some(c => c.id === 'analyse-sequence'));

    await test('Concepts → kaprekar present',
        `${B}/concepts`, 'GET', null,
        d => Array.isArray(d) && d.some(c => c.id === 'kaprekar'));

    // 5. Vedic patterns API
    await test('Vedic Patterns → at least 4 entries',
        `${B}/patterns/vedic`, 'GET', null,
        d => d.patterns && d.patterns.length >= 4);

    // 6. Pattern filter: discoveries?category=pattern → 2 results
    await test('Discoveries → Pattern filter = 2',
        `${B}/discoveries?category=pattern`, 'GET', null,
        d => d.discoveries && d.discoveries.length === 2);

    // 7. Solver pattern operations
    await test('Solver → kaprekar',
        `${B}/solve`, 'POST', { operation: 'kaprekar', input: 3087 },
        d => d.result !== undefined);

    await test('Solver → fibonacci',
        `${B}/solve`, 'POST', { operation: 'fibonacci', input: 8 },
        d => d.result !== undefined);

    await test('Solver → analyse-sequence',
        `${B}/solve`, 'POST', { operation: 'analyse-sequence', input: '1,4,9,16,25' },
        d => d.result !== undefined);

    console.log('\nVerification Complete!');
}

run();
