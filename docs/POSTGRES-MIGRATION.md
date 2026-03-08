# GanitSūtram PostgreSQL Migration Guide

## Overview
GanitSūtram uses a dual-adapter database pattern. By default, it operates on a local SQLite database (`better-sqlite3`) and uses a file at `backend/data/ganitsutram.db`. 
For production environments, high availability, and scaling beyond a single instance, it supports **PostgreSQL**.

The transition requires **zero code changes** to the application logic. The backend automatically switches to PostgreSQL when the `DATABASE_URL` environment variable is defined.

## Prerequisites
1. Ensure the PostgreSQL database is up and running.
2. Obtain the database connection string.

## Migration Steps

Follow these exact steps to safely transition from SQLite to PostgreSQL.

### Step 1: Export Existing SQLite Data
Stop the application to prevent new data from being written. Then, run the export script:

```bash
cd backend
node database/export-sqlite.js
```
*This will generate `backend/data/sqlite-dump.json` containing all your existing platform data.*

### Step 2: Configure Environment Variables
In your `.env` or Server setup (e.g., Railway), set the `DATABASE_URL` parameter using your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://user:password@hostname:5432/dbname
```
*(Optional) You can leave `DB_PATH` in the `.env` file as it will be ignored when `DATABASE_URL` is detected.*

### Step 3: Run PostgreSQL Schema Migrations
Initialize the tables in your PostgreSQL database by running the migration script:

```bash
cd backend
node database/migrate.js
```
*This will execute all DDL statements from `migrations-pg.js`.*

### Step 4: Import Data into PostgreSQL
Load the exported JSON data into your new PostgreSQL database:

```bash
cd backend
node database/import-postgres.js
```
*This script processes tables in dependency order to avoid foreign key violations.*

### Step 5: Start the Application
Start the backend server normally:

```bash
npm start
```
The application will detect `DATABASE_URL`, load the `postgres.js` adapter, and continue operating transparently.

## Full-Text Search (FTS) Differences 
- **SQLite**: Uses the `fts5` virtual table strategy. 
- **PostgreSQL**: Implements `TSVECTOR` combined with `GIN` indexes. We rely on standard `to_tsvector` logic provided by a PostgreSQL trigger during inserts and updates. 

## Rollback / Recovery
If you need to revert to SQLite:
1. Remove or unset the `DATABASE_URL` environment variable.
2. Ensure the original `ganitsutram.db` file is intact at the `DB_PATH` location.
3. Restart the server. SQLite will be used. 

*(Note: Data written to PostgreSQL during the period it was active will not be synced back to SQLite unless manually mapped.)*
