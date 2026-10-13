require('dotenv').config();
const db = require('../src/config/db');

function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  let cleaned = String(rawPhone).replace(/[\s\u00A0\u200B\-\(\)\.]/g, '').trim();
  cleaned = cleaned.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  if (/^(\+20|0020|20)(1[0125]\d{8})$/.test(cleaned)) {
    cleaned = '0' + cleaned.replace(/^(\+20|0020|20)/, '');
  }
  return cleaned;
}

async function migrate() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Reassign orders from ID 7 to ID 34, then delete 7
    await client.query('UPDATE orders SET customer_id = 34 WHERE customer_id = 7');
    await client.query('DELETE FROM customers WHERE id = 7');

    // 2. Delete duplicate 5 (Taky Allah, 0 orders, keeping 13)
    await client.query('DELETE FROM customers WHERE id = 5');

    // 3. Delete duplicate 25 (Abdo, 0 orders, keeping 22)
    await client.query('DELETE FROM customers WHERE id = 25');

    // 4. Delete duplicate 33 (Ahmed El Sayed, 0 orders, keeping 20)
    await client.query('DELETE FROM customers WHERE id = 33');

    // 5. Update all customer phone numbers to normalized format
    const { rows: allCustomers } = await client.query('SELECT id, phone FROM customers');
    for (const c of allCustomers) {
      const norm = normalizePhone(c.phone);
      await client.query('UPDATE customers SET phone = $1 WHERE id = $2', [norm, c.id]);
    }

    // 6. Verify no duplicates remain
    const { rows: dups } = await client.query(
      'SELECT phone, count(*) FROM customers GROUP BY phone HAVING count(*) > 1'
    );
    if (dups.length > 0) {
      throw new Error('Duplicates still present: ' + JSON.stringify(dups));
    }

    // 7. Create unique index on phone
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone_unique ON customers (phone)');
    console.log('Successfully created unique index idx_customers_phone_unique on customers(phone)');

    await client.query('COMMIT');
    console.log('Phone deduplication and unique index migration committed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed and rolled back:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
}

migrate();
