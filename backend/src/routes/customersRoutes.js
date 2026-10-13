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
  authorize('owner'),
  validate(searchQuery, 'query'),
  customersController.searchCustomers
);

router.get('/', authorize('owner'), customersController.listCustomers);

router.post(
  '/',
  authorize('owner'),
  validate(createCustomer),
  customersController.createCustomer
);

router.patch(
  '/:id',
  authorize('owner', 'driver'),
  validate(updateCustomer),
  customersController.updateCustomer
);

router.delete(
  '/:id',
  authorize('owner'),
  customersController.deleteCustomer
);

module.exports = router;
