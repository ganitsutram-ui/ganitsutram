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
