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
 * Purpose: Imports JSON exported data into PostgreSQL.
 */

const fs = require('fs');
const path = require('path');
const db = require('./db');

// List of tables in dependency order (parents first, then children)
const TABLE_ORDER = [
    'users',
    'schools',
    'enrollments',
    'progress',
    'sessions',
    'practice_attempts',
    'discoveries',
    'discovery_patterns',
    'reset_tokens',
    'refresh_sessions',
    'analytics_events',
    'user_badges',
    'user_scores',
    'point_events',
    'cms_content',
    'cms_revisions',
    'cms_media',
    'notifications',
    'notification_prefs',
    'search_index',
    // FTS tables omitted
    'graph_nodes',
    'graph_edges',
    'search_history'
];

async function importData() {
    if (db.type !== 'postgres') {
        console.error('[Import] Error: Required PostgreSQL adapter but found', db.type);
        process.exit(1);
    }

    const dumpFile = path.resolve(__dirname, '../data/sqlite-dump.json');
    if (!fs.existsSync(dumpFile)) {
        console.error('[Import] Error: Cannot find dump file at', dumpFile);
        process.exit(1);
    }

    console.log('[Import] Reading dump file...');
    const data = JSON.parse(fs.readFileSync(dumpFile, 'utf-8'));

    try {
        await db.transaction(async (mockDb) => {
            // First disable constraints if necessary, but we insert in dependency order so we should be fine.
            for (const table of TABLE_ORDER) {
                if (!data[table] || data[table].length === 0) {
                    console.log(`[Import] Skipping empty table ${table}`);
                    continue;
                }

                console.log(`[Import] Inserts into ${table} (${data[table].length} rows)...`);

                const columns = Object.keys(data[table][0]);
                const paramsPlaceholders = columns.map(() => '?').join(', ');
                const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${paramsPlaceholders})`;

                for (const row of data[table]) {
                    const values = columns.map(col => row[col]);
                    await mockDb.run(sql, ...values);
                }
            }
        });

        console.log('[Import] Successfully imported all data.');
    } catch (e) {
        console.error('[Import] Migration failed, rolling back. Error:', e);
    } finally {
        await db.close();
        process.exit(0);
    }
}

importData();
