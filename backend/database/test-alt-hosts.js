/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

const { Client } = require('pg');

async function testHosts() {
    const hosts = [
        'qgngvquybdxtdmcchdtl.supabase.co',
        'qgngvquybdxtdmcchdtl.supabase.com',
        'db.qgngvquybdxtdmcchdtl.pg.supabase.co'
    ];

    for (const host of hosts) {
        console.log(`Testing host: ${host}...`);
        const client = new Client({
            host,
            port: 5432,
            user: 'postgres',
            password: '4vyGkV9YRxwXBUAq',
            database: 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        });

        try {
            await client.connect();
            console.log(`✅ SUCCESS with host: ${host}`);
            await client.end();
            return;
        } catch (e) {
            console.log(`❌ FAILED with host: ${host} - ${e.message}`);
        }
    }
}

testHosts();
