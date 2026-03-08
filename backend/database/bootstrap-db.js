const { Client } = require('pg');

async function bootstrap() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'ganit2082',
        port: 5434,
    });

    try {
        await client.connect();

        // 1. Create DB if not exists
        try {
            await client.query('CREATE DATABASE ganitsutram');
            console.log('✅ Database "ganitsutram" created');
        } catch (e) {
            console.log('ℹ️ Database "ganitsutram" might already exist');
        }

        // 2. Create user if not exists
        try {
            // Note: Postgres CREATE USER doesn't support IF NOT EXISTS in pure SQL,
            // but we can check the catalog or just use a begin block.
            await client.query("CREATE USER ganit_user WITH PASSWORD 'ganit2082'");
            console.log('✅ User "ganit_user" created');
        } catch (e) {
            console.log('ℹ️ User "ganit_user" might already exist');
        }

        // 3. Grant privileges
        try {
            await client.query('ALTER DATABASE ganitsutram OWNER TO ganit_user');
            await client.query('GRANT ALL PRIVILEGES ON DATABASE ganitsutram TO ganit_user');
            console.log('✅ Privileges granted to "ganit_user"');
        } catch (e) {
            console.log('❌ Grant failed:', e.message);
        }

        await client.end();
        console.log('✅ DONE');
        process.exit(0);
    } catch (e) {
        console.error('❌ Bootstrap failed:', e.message);
        process.exit(1);
    }
}

bootstrap();
