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
const { Client } = require('pg');

async function bootstrap() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'ganit2082',
        port: 5434,
    });

    try {
        await client.connect();

        // 1. Create DB if not exists
        try {
            await client.query('CREATE DATABASE ganitsutram');
            console.log('✅ Database "ganitsutram" created');
        } catch (e) {
            console.log('ℹ️ Database "ganitsutram" might already exist');
        }

        // 2. Create user if not exists
        try {
            // Note: Postgres CREATE USER doesn't support IF NOT EXISTS in pure SQL,
            // but we can check the catalog or just use a begin block.
            await client.query("CREATE USER ganit_user WITH PASSWORD 'ganit2082'");
            console.log('✅ User "ganit_user" created');
        } catch (e) {
            console.log('ℹ️ User "ganit_user" might already exist');
        }

        // 3. Grant privileges
        try {
            await client.query('ALTER DATABASE ganitsutram OWNER TO ganit_user');
            await client.query('GRANT ALL PRIVILEGES ON DATABASE ganitsutram TO ganit_user');
            console.log('✅ Privileges granted to "ganit_user"');
        } catch (e) {
            console.log('❌ Grant failed:', e.message);
        }

        await client.end();
        console.log('✅ DONE');
        process.exit(0);
    } catch (e) {
        console.error('❌ Bootstrap failed:', e.message);
        process.exit(1);
    }
}

bootstrap();
