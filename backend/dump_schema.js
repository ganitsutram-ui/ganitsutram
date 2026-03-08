const db = require('./database/db');
async function run() {
    const tables = await db.all("SELECT name, sql FROM sqlite_master WHERE type='table'");
    console.log(JSON.stringify(tables, null, 2));
}
run();
