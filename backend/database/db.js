/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-08
 * 
 * Purpose: Central database access point. 
 *          Loads either SQLite or PostgreSQL adapter based on DATABASE_URL.
 */

// Load environment early, just in case
require('dotenv').config({ path: require('path').resolve(process.cwd(), '../config/.env') });

const sqliteAdapter = require('./adapters/sqlite');
const postgresAdapter = require('./adapters/postgres');

let adapter;

if (process.env.DATABASE_URL) {
    console.log('[DB] Using PostgreSQL Adapter');
    adapter = postgresAdapter;
} else {
    console.log('[DB] Using SQLite Adapter');
    adapter = sqliteAdapter;
}

// Initialize the selected adapter
adapter.init();

module.exports = adapter;
