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
 * Purpose: PostgreSQL database adapter for GanitSūtram backend.
 *          Implements the async db interface required by repositories.
 */

const { Pool } = require('pg');

let pool;

function init() {
    if (pool) return;

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is required for PostgreSQL adapter.');
    }

    pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' && !connectionString.includes('localhost')
            ? { rejectUnauthorized: false }
            : false
    });

    pool.on('error', (err) => {
        console.error('[PostgreSQL] Unexpected error on idle client', err);
        process.exit(-1);
    });
}

/**
 * Translates SQLite style placeholders (?) to PostgreSQL style ($1, $2, ...)
 * @param {string} sql
 * @returns {string} translated sql
 */
function translateParams(sql) {
    let index = 1;
    // Fast translation - handles well-formed SQL where '?' are placeholders
    return sql.replace(/\?/g, () => `$${index++}`);
}

module.exports = {
    type: 'postgres',

    init,

    all: async (sql, ...params) => {
        const pgSql = translateParams(sql);
        try {
            const result = await pool.query(pgSql, params);
            return result.rows;
        } catch (err) {
            console.error('[PostgreSQL] Error in all():', err.message);
            throw err;
        }
    },

    get: async (sql, ...params) => {
        const pgSql = translateParams(sql);
        try {
            const result = await pool.query(pgSql, params);
            return result.rows[0];
        } catch (err) {
            console.error('[PostgreSQL] Error in get():', err.message);
            throw err;
        }
    },

    run: async (sql, ...params) => {
        const pgSql = translateParams(sql);
        try {
            const result = await pool.query(pgSql, params);
            // pg doesn't return lastInsertRowId natively without RETURNING *
            // Providing rowCount to mimic "changes"
            return { changes: result.rowCount };
        } catch (err) {
            console.error('[PostgreSQL] Error in run():', err.message);
            throw err;
        }
    },

    transaction: async (fn) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create a mock db object bound to this specific client transaction
            const mockDb = {
                all: async (s, ...p) => {
                    const res = await client.query(translateParams(s), p);
                    return res.rows;
                },
                get: async (s, ...p) => {
                    const res = await client.query(translateParams(s), p);
                    return res.rows[0];
                },
                run: async (s, ...p) => {
                    const res = await client.query(translateParams(s), p);
                    return { changes: res.rowCount };
                }
            };

            const result = await fn(mockDb);
            await client.query('COMMIT');
            return result;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    exec: async (sql) => {
        try {
            await pool.query(sql);
        } catch (err) {
            console.error('[PostgreSQL] Error in exec():', err.message);
            throw err;
        }
    },

    close: async () => {
        if (pool) {
            await pool.end();
        }
    }
};
