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
 * Purpose: SQLite database adapter for GanitSūtram backend.
 *          Wraps synchronous better-sqlite3 with an async interface 
 *          to ensure portability with PostgreSQL.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function init() {
    if (db) return;

    const DB_PATH = process.env.DB_PATH
        ? path.resolve(process.cwd(), process.env.DB_PATH)
        : path.join(__dirname, '../../data/ganitsutram.db');

    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    try {
        db = new Database(DB_PATH);
        // Optimization: Write-Ahead Logging for better performance
        db.pragma('journal_mode = WAL');
        // Integrity: Enforce foreign key constraints
        db.pragma('foreign_keys = ON');
        db.prepare("CREATE TABLE IF NOT EXISTS system_errors (error_id TEXT PRIMARY KEY, session_id TEXT, url TEXT, message TEXT NOT NULL, stack TEXT, user_agent TEXT, created_at DATETIME NOT NULL)").run();
    } catch (error) {
        console.error(`[SQLite] Failed to open database at ${DB_PATH}:`, error);
        process.exit(1);
    }
}

module.exports = {
    type: 'sqlite',

    init,

    all: async (sql, ...params) => {
        try {
            return db.prepare(sql).all(...params);
        } catch (err) {
            console.error('[SQLite] Error in all():', err.message);
            throw err;
        }
    },

    get: async (sql, ...params) => {
        try {
            return db.prepare(sql).get(...params);
        } catch (err) {
            console.error('[SQLite] Error in get():', err.message);
            throw err;
        }
    },

    run: async (sql, ...params) => {
        try {
            const info = db.prepare(sql).run(...params);
            return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
        } catch (err) {
            console.error('[SQLite] Error in run():', err.message);
            throw err;
        }
    },

    transaction: async (fn) => {
        // SQLite transactions are synchronous, but we expose an async wrapper 
        // to maintain interface conformity with postgres.js
        const tx = db.transaction(async (mockDb) => {
            return await fn(mockDb);
        });

        // Pass "this" adapter down as the mockDb since its methods work inside the transaction
        return await tx(module.exports);
    },

    exec: async (sql) => {
        try {
            db.exec(sql);
        } catch (err) {
            console.error('[SQLite] Error in exec():', err.message);
            throw err;
        }
    },

    close: async () => {
        if (db) {
            db.close();
        }
    }
};
