const { Client } = require('pg');

const combinations = [
    { user: 'ganit_user', pass: 'ganit2082', db: 'ganitsutram' },
    { user: 'postgres', pass: 'ganit2082', db: 'postgres' },
    { user: 'ganit_user', pass: 'ganit2082', db: 'postgres' },
    { user: 'postgres', pass: 'ganit2082', db: 'ganitsutram' }
];

async function test() {
    for (const combo of combinations) {
        console.log(`Testing: user=${combo.user}, db=${combo.db}, pass=${combo.pass} on port 5434...`);
        const client = new Client({
            user: combo.user,
            host: 'localhost',
            database: combo.db,
            password: combo.pass,
            port: 5434,
        });

        try {
            await client.connect();
            console.log(`✅ SUCCESS: Connected with user=${combo.user}, db=${combo.db}`);
            await client.end();
            return;
        } catch (e) {
            console.log(`❌ FAILED: ${e.message}`);
        }
    }
}

test();
