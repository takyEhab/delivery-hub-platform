/**
 * Creates the initial owner account. Run once after applying schema.sql:
 *
 *   npm run db:seed
 *
 * Override defaults via env: OWNER_NAME, OWNER_PHONE, OWNER_EMAIL, OWNER_PASSWORD
 */
require('dotenv').config();

const db = require('../src/config/db');
const { hashPassword } = require('../src/utils/password');

async function seed() {
  const name = process.env.OWNER_NAME || 'Shop Owner';
  const phone = process.env.OWNER_PHONE || '0500000000';
  const email = process.env.OWNER_EMAIL || 'owner@deliveryhub.local';
  const password = process.env.OWNER_PASSWORD || 'changeme123';

  const existing = await db.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['owner']);
  if (existing.rows.length > 0) {
    console.log('Owner account already exists — skipping seed.');
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);
  await db.query(
    `INSERT INTO users (name, phone, email, password_hash, role)
     VALUES ($1, $2, $3, $4, 'owner')`,
    [name, phone, email, passwordHash]
  );

  console.log(`Owner created: phone=${phone} (change the default password immediately)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
