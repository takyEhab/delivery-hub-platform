const { AppError } = require('../utils/errors');

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.code === '23505') {
    if (err.constraint === 'idx_customers_phone_unique' || err.detail?.includes('phone')) {
      return res.status(400).json({ error: 'A customer with this phone number already exists' });
    }
    return res.status(400).json({ error: 'A record with that value already exists' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist' });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFoundHandler, errorHandler };
