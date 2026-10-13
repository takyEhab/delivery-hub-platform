const customersQueries = require('../db/queries/customers');
const ordersQueries = require('../db/queries/orders');
const { AppError } = require('../utils/errors');

async function listCustomers(req, res, next) {
  try {
    const customers = await customersQueries.listAll();
    res.json({ customers });
  } catch (err) {
    next(err);
  }
}

async function searchCustomers(req, res, next) {
  try {
    const { q } = req.query;
    const customers = await customersQueries.search(q);
    res.json({ customers });
  } catch (err) {
    next(err);
  }
}

async function createCustomer(req, res, next) {
  try {
    const { name, phone, address, location_url, notes } = req.body;
    const existing = await customersQueries.findByPhone(phone);
    if (existing) {
      throw new AppError(
        `A customer with this phone number already exists (${existing.name})`,
        400
      );
    }
    const customer = await customersQueries.create({ name, phone, address, location_url, notes });
    res.status(201).json({ customer });
  } catch (err) {
    next(err);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { phone } = req.body;

    const current = await customersQueries.findById(id);
    if (!current) {
      throw new AppError('Customer not found', 404);
    }

    // Driver authorization: Drivers can ONLY update a customer if they have an assigned order for them
    if (req.user.role === 'driver') {
      const isAssigned = await ordersQueries.isCustomerAssignedToDriver(id, req.user.id);
      if (!isAssigned) {
        throw new AppError('You are not authorized to update this customer', 403);
      }
      // Drivers can only update address, location_url, and notes
      const driverUpdates = {};
      if (req.body.address !== undefined) driverUpdates.address = req.body.address;
      if (req.body.location_url !== undefined) driverUpdates.location_url = req.body.location_url;
      if (req.body.notes !== undefined) driverUpdates.notes = req.body.notes;
      const customer = await customersQueries.update(id, driverUpdates);
      return res.json({ customer });
    }

    if (phone) {
      const existing = await customersQueries.findByPhone(phone);
      if (existing && String(existing.id) !== String(id)) {
        throw new AppError(
          `Another customer with this phone number already exists (${existing.name})`,
          400
        );
      }
    }

    const customer = await customersQueries.update(id, req.body);
    res.json({ customer });
  } catch (err) {
    next(err);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await customersQueries.deleteCustomer(id);
    if (!deleted) {
      throw new AppError('Customer not found', 404);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCustomers,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};

