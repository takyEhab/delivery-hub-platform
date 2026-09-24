const express = require('express');
const ordersController = require('../controllers/ordersController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createOrder,
  updateOrder,
  assignOrder,
  updateOrderStatus,
} = require('../validators/schemas');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize('owner'),
  validate(createOrder),
  ordersController.createOrder
);

router.get('/', ordersController.listOrders);

router.get('/:id', ordersController.getOrder);

router.put(
  '/:id',
  authorize('owner'),
  validate(updateOrder),
  ordersController.updateOrder
);

router.patch(
  '/:id',
  authorize('owner'),
  validate(updateOrder),
  ordersController.updateOrder
);

router.patch(
  '/:id/assign',
  authorize('owner'),
  validate(assignOrder),
  ordersController.assignOrder
);

router.patch(
  '/:id/status',
  authorize('owner', 'driver'),
  validate(updateOrderStatus),
  ordersController.updateOrderStatus
);

module.exports = router;
