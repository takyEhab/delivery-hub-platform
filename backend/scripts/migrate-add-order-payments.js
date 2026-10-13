require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Adding payment columns to orders table...');
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
      ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS payment_notes TEXT;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
    `);

    // Backfill total_amount from items JSON if available
    const { rows: orders } = await client.query('SELECT id, items, status, total_amount FROM orders');
    for (const o of orders) {
      let calculatedTotal = 0;
      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          const qty = parseInt(item.quantity, 10) || 1;
          const price = parseFloat(item.price) || 0;
          calculatedTotal += qty * price;
        }
      }
      if (calculatedTotal > 0 && Number(o.total_amount) === 0) {
        await client.query(
          'UPDATE orders SET total_amount = $1 WHERE id = $2',
          [calculatedTotal, o.id]
        );
      }
      // If order was already delivered, mark as paid by default
      if (o.status === 'delivered') {
        await client.query(
          `UPDATE orders SET payment_status = 'paid', paid_at = COALESCE(paid_at, updated_at) WHERE id = $1 AND payment_status = 'unpaid'`,
          [o.id]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Payment migration completed successfully!');
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
