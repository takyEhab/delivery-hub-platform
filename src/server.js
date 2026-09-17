const app = require('./app');
const { port } = require('./config/env');
const db = require('./config/db');

async function start() {
  try {
    await db.query('SELECT 1');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Delivery Hub API listening on port ${port} (0.0.0.0)`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
