/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

// migrate_profile.js
const db = require('./backend/database/db');

async function migrate() {
    try {
        console.log(`[Migrate] Current DB type: ${db.type}`);
        
        if (db.type === 'postgres') {
            console.log("Running PostgreSQL migration...");
            await db.run("ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255)");
            await db.run("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT");
        } else {
            console.log("Running SQLite migration...");
            // SQLite doesn't support ADD COLUMN IF NOT EXISTS
            try {
                await db.run("ALTER TABLE users ADD COLUMN display_name VARCHAR(255)");
            } catch (e) {
                if (!e.message.includes('duplicate column name')) throw e;
                console.log("Column display_name already exists.");
            }
            try {
                await db.run("ALTER TABLE users ADD COLUMN avatar_url TEXT");
            } catch (e) {
                if (!e.message.includes('duplicate column name')) throw e;
                console.log("Column avatar_url already exists.");
            }
        }
        
        console.log("Migration successful!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
