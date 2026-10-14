const db = require('../../config/db');

const ORDER_SELECT = `
  o.id,
  o.customer_id,
  o.assigned_driver_id,
  o.items,
  o.total_amount,
  o.payment_status,
  o.paid_at,
  o.payment_notes,
  o.status,
  o.created_at,
  o.updated_at,
  c.name AS customer_name,
  c.phone AS customer_phone,
  c.address AS customer_address,
  c.location_url AS customer_location_url,
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
    total_amount: parseFloat(row.total_amount || 0),
    payment_status: row.payment_status || 'unpaid',
    paid_at: row.paid_at || null,
    payment_notes: row.payment_notes || null,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer: {
      id: row.customer_id,
      name: row.customer_name,
      phone: row.customer_phone,
      address: row.customer_address,
      location_url: row.customer_location_url,
      notes: row.customer_notes,
    },
    driver: row.assigned_driver_id
      ? { id: row.assigned_driver_id, name: row.driver_name, phone: row.driver_phone }
      : null,
  };
}

async function create({ customerId, items, totalAmount = 0, paymentStatus = 'unpaid', paymentNotes = null, driverId = null }) {
  let finalItems = items;
  if (!finalItems) {
    finalItems = [{ name: 'طلب أسماك', quantity: 1, price: totalAmount }];
  }
  const itemsValue = typeof finalItems === 'string' ? JSON.stringify([{ description: finalItems }]) : JSON.stringify(finalItems);
  
  // Compute totalAmount if 0 but items have prices
  let computedTotal = parseFloat(totalAmount) || 0;
  if (computedTotal === 0 && Array.isArray(finalItems)) {
    for (const it of finalItems) {
      const q = parseInt(it.quantity, 10) || 1;
      const p = parseFloat(it.price) || 0;
      computedTotal += q * p;
    }
  }

  const isPaid = paymentStatus === 'paid';
  const { rows } = await db.query(
    `INSERT INTO orders (customer_id, items, total_amount, payment_status, paid_at, payment_notes, assigned_driver_id)
     VALUES ($1, $2::jsonb, $3, $4, ${isPaid ? 'NOW()' : 'NULL'}, $5, $6)
     RETURNING id`,
    [customerId, itemsValue, computedTotal, paymentStatus || 'unpaid', paymentNotes || null, driverId || null]
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

async function updateStatus(orderId, status, driverId = null, { paymentStatus, paymentNotes } = {}) {
  const sets = ['status = $2'];
  const params = [orderId, status];
  let paramIndex = 3;

  if (paymentStatus) {
    sets.push(`payment_status = $${paramIndex++}`);
    params.push(paymentStatus);
    if (paymentStatus === 'paid') {
      sets.push('paid_at = NOW()');
    } else {
      sets.push('paid_at = NULL');
    }
  }

  if (paymentNotes !== undefined) {
    sets.push(`payment_notes = $${paramIndex++}`);
    params.push(paymentNotes);
  }

  let whereClause = 'WHERE id = $1';
  if (driverId !== null) {
    whereClause += ` AND assigned_driver_id = $${paramIndex++}`;
    params.push(driverId);
  }

  const query = `UPDATE orders SET ${sets.join(', ')} ${whereClause} RETURNING id`;
  const { rows } = await db.query(query, params);
  if (rows.length === 0) {
    return null;
  }
  return findById(orderId);
}

async function updatePayment(orderId, { paymentStatus, paymentNotes }) {
  const sets = [];
  const params = [orderId];
  let paramIndex = 2;

  if (paymentStatus) {
    sets.push(`payment_status = $${paramIndex++}`);
    params.push(paymentStatus);
    if (paymentStatus === 'paid') {
      sets.push('paid_at = NOW()');
    } else {
      sets.push('paid_at = NULL');
    }
  }

  if (paymentNotes !== undefined) {
    sets.push(`payment_notes = $${paramIndex++}`);
    params.push(paymentNotes);
  }

  if (sets.length === 0) {
    return findById(orderId);
  }

  const query = `UPDATE orders SET ${sets.join(', ')} WHERE id = $1 RETURNING id`;
  const { rows } = await db.query(query, params);
  if (rows.length === 0) {
    return null;
  }
  return findById(orderId);
}

async function update(orderId, { customerId, assignedDriverId, items, status, totalAmount, paymentStatus, paymentNotes }) {
  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (customerId !== undefined) {
    updates.push(`customer_id = $${paramIndex++}`);
    params.push(customerId);
  }

  if (assignedDriverId !== undefined) {
    updates.push(`assigned_driver_id = $${paramIndex++}`);
    params.push(assignedDriverId);
  }

  if (items !== undefined) {
    const itemsValue = typeof items === 'string' ? JSON.stringify([{ description: items }]) : JSON.stringify(items);
    updates.push(`items = $${paramIndex++}::jsonb`);
    params.push(itemsValue);
  }

  if (totalAmount !== undefined) {
    updates.push(`total_amount = $${paramIndex++}`);
    params.push(parseFloat(totalAmount) || 0);
  }

  if (paymentStatus !== undefined) {
    updates.push(`payment_status = $${paramIndex++}`);
    params.push(paymentStatus);
    if (paymentStatus === 'paid') {
      updates.push('paid_at = NOW()');
    } else {
      updates.push('paid_at = NULL');
    }
  }

  if (paymentNotes !== undefined) {
    updates.push(`payment_notes = $${paramIndex++}`);
    params.push(paymentNotes);
  }

  if (status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    params.push(status);
  }

  if (updates.length === 0) {
    return findById(orderId);
  }

  params.push(orderId);
  const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
  const { rows } = await db.query(query, params);
  if (rows.length === 0) {
    return null;
  }
  return findById(orderId);
}

async function isCustomerAssignedToDriver(customerId, driverId) {
  const { rows } = await db.query(
    'SELECT 1 FROM orders WHERE customer_id = $1 AND assigned_driver_id = $2 LIMIT 1',
    [customerId, driverId]
  );
  return rows.length > 0;
}

async function deleteOrder(orderId) {
  const { rowCount } = await db.query('DELETE FROM orders WHERE id = $1', [orderId]);
  return rowCount > 0;
}

module.exports = {
  create,
  findById,
  listAll,
  listByDriver,
  assignDriver,
  updateStatus,
  updatePayment,
  update,
  isCustomerAssignedToDriver,
  deleteOrder,
};
