const db = require('../config/db');
const { verifyToken } = require('../utils/jwt');
const { AppError } = require('../utils/errors');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = header.slice(7);
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }

    const { rows } = await db.query(
      `SELECT id, name, phone, email, role, is_active
       FROM users WHERE id = $1`,
      [decoded.userId]
    );

    const user = rows[0];
    if (!user || !user.is_active) {
      throw new AppError('Invalid or inactive account', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
