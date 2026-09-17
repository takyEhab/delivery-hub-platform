const db = require('../../config/db');

async function listAll() {
  const { rows } = await db.query(
    'SELECT id, name, phone, address, notes, created_at FROM customers ORDER BY name ASC'
  );
  return rows;
}

async function search(term) {
  const pattern = `%${term}%`;
  const { rows } = await db.query(
    `SELECT id, name, phone, address, notes, created_at
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
    'SELECT id, name, phone, address, notes, created_at FROM customers WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create({ name, phone, address, notes }) {
  const { rows } = await db.query(
    `INSERT INTO customers (name, phone, address, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, phone, address, notes, created_at`,
    [name, phone, address || null, notes || null]
  );
  return rows[0];
}

async function update(id, fields) {
  const allowed = ['name', 'phone', 'address', 'notes'];
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
    `UPDATE customers SET ${sets.join(', ')} WHERE id = $${i}
     RETURNING id, name, phone, address, notes, created_at`,
    values
  );
  return rows[0] || null;
}

module.exports = {
  listAll,
  search,
  findById,
  create,
  update,
};
