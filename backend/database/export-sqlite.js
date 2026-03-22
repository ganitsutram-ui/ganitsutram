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
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 *
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-08
 *
 * Purpose: Exports SQLite database content to JSON for migration.
 */

const fs = require('fs');
const path = require('path');
// Force SQLite adapter for export even if DATABASE_URL is set
const db = require('./adapters/sqlite');

async function exportData() {
    console.log('[Export] Initializing SQLite connection...');
    db.init();

    const dumpFile = path.resolve(__dirname, '../data/sqlite-dump.json');
    const data = {};

    try {
        const tablesQuery = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'search_fts%'");
        const tables = tablesQuery.map(t => t.name);

        console.log(`[Export] Found ${tables.length} tables to export.`);

        for (const table of tables) {
            console.log(`[Export] Extracting from ${table}...`);
            const rows = await db.all(`SELECT * FROM ${table}`);
            data[table] = rows;
        }

        fs.writeFileSync(dumpFile, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`[Export] Successfully exported data to ${dumpFile}`);
    } catch (e) {
        console.error('[Export] Failed:', e);
    } finally {
        await db.close();
        process.exit(0);
    }
}

exportData();
