const express = require('express');
const customersController = require('../controllers/customersController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createCustomer,
  updateCustomer,
  searchQuery,
} = require('../validators/schemas');

const router = express.Router();

router.use(authenticate);

router.get(
  '/search',
  validate(searchQuery, 'query'),
  customersController.searchCustomers
);

router.get('/', customersController.listCustomers);

router.post(
  '/',
  authorize('owner'),
  validate(createCustomer),
  customersController.createCustomer
);

router.patch(
  '/:id',
  authorize('owner'),
  validate(updateCustomer),
  customersController.updateCustomer
);

module.exports = router;
