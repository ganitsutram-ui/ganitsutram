/*
Ganitsutram | AITDL Network © 2026
Supabase Connection Test
*/
require('dotenv').config({ path: require('path').resolve(__dirname, '../../config/.env') });
const { Client } = require('pg');

async function testSupabase() {
    const connectionString = process.env.DATABASE_URL;
    console.log(`Testing connection to: ${connectionString?.split('@')[1] || 'URL NOT FOUND'}`);

    if (!connectionString) {
        console.error('❌ ERROR: DATABASE_URL not found in config/.env');
        return;
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ SUCCESS: Connected to Supabase PostgreSQL!');
        const res = await client.query('SELECT NOW() as current_time');
        console.log('🕒 Server time:', res.rows[0].current_time);
        await client.end();
    } catch (e) {
        console.error('❌ FAILED to connect to Supabase:', e.message);
        if (e.message.includes('password authentication failed')) {
            console.log('👉 TIP: Please check the database password in config/.env');
        }
    }
}

testSupabase();
