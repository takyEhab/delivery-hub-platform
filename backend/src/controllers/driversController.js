const usersQueries = require('../db/queries/users');
const { hashPassword } = require('../utils/password');
const { AppError } = require('../utils/errors');

async function listDrivers(req, res, next) {
  try {
    const drivers = await usersQueries.listDrivers();
    res.json({ drivers });
  } catch (err) {
    next(err);
  }
}

async function createDriver(req, res, next) {
  try {
    const { name, phone, email, password } = req.body;

    const existing = await usersQueries.findByPhone(phone);
    if (existing) {
      throw new AppError('A user with this phone already exists', 400);
    }

    const passwordHash = await hashPassword(password);
    const driver = await usersQueries.createUser({
      name,
      phone,
      email: email || null,
      passwordHash,
      role: 'driver',
    });

    res.status(201).json({ driver });
  } catch (err) {
    next(err);
  }
}

async function updateDriver(req, res, next) {
  try {
    const { id } = req.params;
    const { name, phone, email, password, is_active } = req.body;

    const existing = await usersQueries.findById(id);
    if (!existing || existing.role !== 'driver') {
      throw new AppError('Driver not found', 404);
    }

    if (phone && phone !== existing.phone) {
      const phoneTaken = await usersQueries.findByPhone(phone);
      if (phoneTaken) {
        throw new AppError('A user with this phone already exists', 400);
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email || null;
    if (is_active !== undefined) updates.is_active = is_active;
    if (password) updates.password_hash = await hashPassword(password);

    const driver = await usersQueries.updateUser(id, updates);
    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    res.json({ driver });
  } catch (err) {
    next(err);
  }
}

async function deleteDriver(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await usersQueries.findById(id);
    if (!existing || existing.role !== 'driver') {
      throw new AppError('Driver not found', 404);
    }

    const deleted = await usersQueries.deleteDriver(id);
    if (!deleted) {
      throw new AppError('Driver not found', 404);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
};
