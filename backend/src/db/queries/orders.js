const db = require('../../config/db');

const ORDER_SELECT = `
  o.id,
  o.customer_id,
  o.assigned_driver_id,
  o.items,
  o.status,
  o.created_at,
  o.updated_at,
  c.name AS customer_name,
  c.phone AS customer_phone,
  c.address AS customer_address,
  c.notes AS customer_notes,
  d.name AS driver_name,
  d.phone AS driver_phone
`;

const ORDER_FROM = `
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  LEFT JOIN users d ON d.id = o.assigned_driver_id
`;

function mapOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    customer_id: row.customer_id,
    assigned_driver_id: row.assigned_driver_id,
    items: row.items,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer: {
      id: row.customer_id,
      name: row.customer_name,
      phone: row.customer_phone,
      address: row.customer_address,
      notes: row.customer_notes,
    },
    driver: row.assigned_driver_id
      ? { id: row.assigned_driver_id, name: row.driver_name, phone: row.driver_phone }
      : null,
  };
}

async function create({ customerId, items }) {
  const itemsValue = typeof items === 'string' ? JSON.stringify([{ description: items }]) : JSON.stringify(items);
  const { rows } = await db.query(
    `INSERT INTO orders (customer_id, items)
     VALUES ($1, $2::jsonb)
     RETURNING id`,
    [customerId, itemsValue]
  );
  return findById(rows[0].id);
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT ${ORDER_SELECT} ${ORDER_FROM} WHERE o.id = $1`,
    [id]
  );
  return mapOrder(rows[0]);
}

async function listAll() {
  const { rows } = await db.query(
    `SELECT ${ORDER_SELECT} ${ORDER_FROM} ORDER BY o.created_at DESC`
  );
  return rows.map(mapOrder);
}

async function listByDriver(driverId) {
  const { rows } = await db.query(
    `SELECT ${ORDER_SELECT} ${ORDER_FROM}
     WHERE o.assigned_driver_id = $1
     ORDER BY o.created_at DESC`,
    [driverId]
  );
  return rows.map(mapOrder);
}

async function assignDriver(orderId, driverId) {
  const { rows } = await db.query(
    `UPDATE orders
     SET assigned_driver_id = $2
     WHERE id = $1 AND assigned_driver_id IS NULL
     RETURNING id`,
    [orderId, driverId]
  );
  if (rows.length === 0) {
    const existing = await findById(orderId);
    if (!existing) return { notFound: true };
    return { alreadyAssigned: true, order: existing };
  }
  return { order: await findById(orderId) };
}

async function updateStatus(orderId, status, driverId = null) {
  let query;
  let params;

  if (driverId !== null) {
    query = `UPDATE orders SET status = $2
             WHERE id = $1 AND assigned_driver_id = $3
             RETURNING id`;
    params = [orderId, status, driverId];
  } else {
    query = `UPDATE orders SET status = $2 WHERE id = $1 RETURNING id`;
    params = [orderId, status];
  }

  const { rows } = await db.query(query, params);
  if (rows.length === 0) {
    return null;
  }
  return findById(orderId);
}

module.exports = {
  create,
  findById,
  listAll,
  listByDriver,
  assignDriver,
  updateStatus,
};
