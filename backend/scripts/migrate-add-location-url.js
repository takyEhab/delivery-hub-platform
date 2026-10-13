require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS location_url TEXT');
    await client.query('COMMIT');
    console.log('Successfully added location_url column to customers table!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
}

migrate();
