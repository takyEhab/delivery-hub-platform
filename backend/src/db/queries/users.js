const db = require('../../config/db');

const PUBLIC_FIELDS = 'id, name, phone, email, role, is_active, created_at';

function toPublicUser(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return rest;
}

async function findByPhone(phone) {
  const { rows } = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function findByIdWithPassword(id) {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createUser({ name, phone, email, passwordHash, role = 'driver' }) {
  const { rows } = await db.query(
    `INSERT INTO users (name, phone, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${PUBLIC_FIELDS}`,
    [name, phone, email || null, passwordHash, role]
  );
  return rows[0];
}

async function listDrivers() {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE role = 'driver' ORDER BY name ASC`
  );
  return rows;
}

async function updateUser(id, fields) {
  const allowed = ['name', 'phone', 'email', 'password_hash', 'is_active'];
  const sets = [];
  const values = [];
  let i = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = $${i++}`);
      values.push(fields[key]);
    }
  }

  if (sets.length === 0) {
    return findById(id);
  }

  values.push(id);
  const { rows } = await db.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${i} AND role = 'driver'
     RETURNING ${PUBLIC_FIELDS}`,
    values
  );
  return rows[0] || null;
}

async function deleteDriver(id) {
  const { rowCount } = await db.query(
    "DELETE FROM users WHERE id = $1 AND role = 'driver'",
    [id]
  );
  return rowCount > 0;
}

async function findActiveDriverById(id) {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_FIELDS} FROM users
     WHERE id = $1 AND role = 'driver' AND is_active = TRUE`,
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  toPublicUser,
  findByPhone,
  findById,
  findByIdWithPassword,
  createUser,
  listDrivers,
  updateUser,
  deleteDriver,
  findActiveDriverById,
};
