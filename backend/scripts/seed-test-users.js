require('dotenv').config();
const db = require('../src/config/db');
const { hashPassword } = require('../src/utils/password');

async function seedTestUsers() {
  // 1. Ensure Owner
  const ownerHash = await hashPassword('changeme123');
  const ownerRes = await db.query("SELECT id FROM users WHERE phone = '01007479928'");
  if (ownerRes.rows.length > 0) {
    await db.query("UPDATE users SET password_hash = $1 WHERE phone = '01007479928'", [ownerHash]);
    console.log('Owner 01007479928 password updated to changeme123');
  } else {
    await db.query(
      "INSERT INTO users (name, phone, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, 'owner', true)",
      ['Shop Owner', '01007479928', 'owner@deliveryhub.local', ownerHash]
    );
    console.log('Owner 01007479928 created');
  }

  // 2. Ensure Driver
  const driverHash = await hashPassword('driver123');
  const driverRes = await db.query("SELECT id FROM users WHERE phone = '0501112233'");
  if (driverRes.rows.length > 0) {
    await db.query("UPDATE users SET password_hash = $1, is_active = true WHERE phone = '0501112233'", [driverHash]);
    console.log('Driver 0501112233 updated');
  } else {
    await db.query(
      "INSERT INTO users (name, phone, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, 'driver', true)",
      ['Alex Driver', '0501112233', 'alex.driver@deliveryhub.local', driverHash]
    );
    console.log('Driver 0501112233 created');
  }

  process.exit(0);
}

seedTestUsers().catch((err) => {
  console.error('Seed test users failed:', err);
  process.exit(1);
});
