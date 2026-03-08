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
 * Purpose: Auto-detects database type and runs migrations.
 */

const db = require('./db');
const { migrations: pgMigrations } = require('./migrations-pg');

async function runMigrations() {
    console.log(`[Migrate] Starting migrations for ${db.type}...`);

    if (db.type === 'postgres') {
        try {
            for (const migration of pgMigrations) {
                await db.exec(migration);
            }
            console.log('[Migrate] PostgreSQL migrations completed successfully.');
        } catch (error) {
            console.error('[Migrate] PostgreSQL migrations failed:', error);
            process.exit(1);
        }
    } else {
        console.log('[Migrate] SQLite detected. Currently relying on pre-existing ganitsutram.db file.');
        // If a migrations-sqlite.js existed, we would run it here.
    }

    // Close connection for scripts
    if (require.main === module) {
        await db.close();
        process.exit(0);
    }
}

// Export for programmatic use or run directly
if (require.main === module) {
    runMigrations();
} else {
    module.exports = runMigrations;
}
