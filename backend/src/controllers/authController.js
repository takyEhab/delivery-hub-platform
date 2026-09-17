const usersQueries = require('../db/queries/users');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { AppError } = require('../utils/errors');

async function registerDriver(req, res, next) {
  try {
    const { name, phone, email, password } = req.body;

    const existing = await usersQueries.findByPhone(phone);
    if (existing) {
      throw new AppError('A user with this phone already exists', 400);
    }

    const passwordHash = await hashPassword(password);
    const user = await usersQueries.createUser({
      name,
      phone,
      email: email || null,
      passwordHash,
      role: 'driver',
    });

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { phone, password } = req.body;

    const user = await usersQueries.findByPhone(phone);
    if (!user || !user.is_active) {
      throw new AppError('Invalid phone or password', 401);
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      throw new AppError('Invalid phone or password', 401);
    }

    const token = signToken({ userId: user.id, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerDriver, login };
