/*
Project: GanitSūtram
API Verification Script: api.test.js
Usage: node api.test.js
*/

async function testEndpoint(name, url, method, body = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);

        const resp = await fetch(url, options);
        const data = await resp.json();

        if (resp.ok) {
            console.log(`✅ ${name} - SUCCESS`);
            return data;
        } else {
            console.error(`❌ ${name} - FAILED (${resp.status})`);
            console.error(data);
            process.exit(1);
        }
    } catch (err) {
        console.error(`❌ ${name} - ERROR`);
        console.error(err);
        process.exit(1);
    }
}

async function run() {
    console.log("Starting API Integration Verification...\n");

    const BASE = "http://localhost:3000/api";

    // 1. Analyse Sequence
    await testEndpoint("Analyse Sequence", `${BASE}/patterns/analyse`, "POST", { numbers: [2, 4, 6, 8, 10] });

    // 2. Kaprekar
    await testEndpoint("Kaprekar Routine", `${BASE}/patterns/kaprekar`, "POST", { n: 3087 });

    // 3. Fibonacci
    await testEndpoint("Fibonacci", `${BASE}/patterns/fibonacci`, "POST", { count: 8 });

    // 4. Squares
    await testEndpoint("Squares pattern", `${BASE}/patterns/squares`, "POST", { count: 9 });

    // 5. Vedic List
    await testEndpoint("Vedic Patterns List", `${BASE}/patterns/vedic`, "GET");

    // 6. Solver Extensions
    await testEndpoint("Solver: Kaprekar", `${BASE}/solve`, "POST", { operation: "kaprekar", input: 3087 });
    await testEndpoint("Solver: Fibonacci", `${BASE}/solve`, "POST", { operation: "fibonacci", input: 8 });
    await testEndpoint("Solver: Sequence", `${BASE}/solve`, "POST", { operation: "analyse-sequence", input: "1,2,3" });

    console.log("\nAll API endpoints verified! 🚀");
}

run();
