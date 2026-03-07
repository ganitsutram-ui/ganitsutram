/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Single shared SQLite connection via better-sqlite3.
 */

const Database = require('better-sqlite3');
const path = require('path');

// Support DB_PATH from .env, fallback to local data folder
const DB_PATH = process.env.DB_PATH
    ? path.resolve(process.cwd(), process.env.DB_PATH)
    : path.join(__dirname, '../data/ganitsutram.db');

const db = new Database(DB_PATH);

// Optimization: Write-Ahead Logging for better performance
db.pragma('journal_mode = WAL');
// Integrity: Enforce foreign key constraints
db.pragma('foreign_keys = ON');

module.exports = db;
