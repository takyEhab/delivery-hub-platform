const customersQueries = require('../db/queries/customers');
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
    const customer = await customersQueries.create(req.body);
    res.status(201).json({ customer });
  } catch (err) {
    next(err);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await customersQueries.update(id, req.body);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    res.json({ customer });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCustomers,
  searchCustomers,
  createCustomer,
  updateCustomer,
};
