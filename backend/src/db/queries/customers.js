const db = require('../../config/db');
const { normalizePhone } = require('../../utils/phone');

async function listAll() {
  const { rows } = await db.query(
    'SELECT id, name, phone, address, location_url, notes, created_at FROM customers ORDER BY name ASC'
  );
  return rows;
}

async function search(term) {
  const pattern = `%${term}%`;
  const { rows } = await db.query(
    `SELECT id, name, phone, address, location_url, notes, created_at
     FROM customers
     WHERE name ILIKE $1 OR phone ILIKE $1
     ORDER BY name ASC
     LIMIT 50`,
    [pattern]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await db.query(
    'SELECT id, name, phone, address, location_url, notes, created_at FROM customers WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function findByPhone(phone) {
  if (!phone) return null;
  const normalized = normalizePhone(phone);
  const { rows } = await db.query(
    'SELECT id, name, phone, address, location_url, notes, created_at FROM customers WHERE phone = $1 OR phone = $2 LIMIT 1',
    [normalized, phone]
  );
  return rows[0] || null;
}

async function create({ name, phone, address, location_url, notes }) {
  const normalized = normalizePhone(phone);
  const { rows } = await db.query(
    `INSERT INTO customers (name, phone, address, location_url, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, phone, address, location_url, notes, created_at`,
    [name, normalized, address || null, location_url || null, notes || null]
  );
  return rows[0];
}

async function update(id, fields) {
  const allowed = ['name', 'phone', 'address', 'location_url', 'notes'];
  const sets = [];
  const values = [];
  let i = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      const val = key === 'phone' ? normalizePhone(fields[key]) : fields[key];
      sets.push(`${key} = $${i++}`);
      values.push(val);
    }
  }

  if (sets.length === 0) {
    return findById(id);
  }

  values.push(id);
  const { rows } = await db.query(
    `UPDATE customers SET ${sets.join(', ')} WHERE id = $${i}
     RETURNING id, name, phone, address, location_url, notes, created_at`,
    values
  );
  return rows[0] || null;
}

async function deleteCustomer(id) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT id, name, phone FROM customers WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    await client.query('DELETE FROM orders WHERE customer_id = $1', [id]);
    await client.query('DELETE FROM customers WHERE id = $1', [id]);
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  listAll,
  search,
  findById,
  findByPhone,
  create,
  update,
  deleteCustomer,
};

