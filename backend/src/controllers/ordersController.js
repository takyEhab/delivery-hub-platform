const ordersQueries = require('../db/queries/orders');
const customersQueries = require('../db/queries/customers');
const usersQueries = require('../db/queries/users');
const { AppError } = require('../utils/errors');

const STATUS_FLOW = {
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
};

function assertStatusTransition(current, next) {
  const allowed = STATUS_FLOW[current] || [];
  if (!allowed.includes(next)) {
    throw new AppError(
      `Cannot change status from '${current}' to '${next}'`,
      400
    );
  }
}

function canViewOrder(user, order) {
  if (user.role === 'owner') return true;
  return order.assigned_driver_id === user.id;
}

async function createOrder(req, res, next) {
  try {
    let customerId = req.body.customer_id;

    if (req.body.customer) {
      const created = await customersQueries.create(req.body.customer);
      customerId = created.id;
    } else {
      const customer = await customersQueries.findById(customerId);
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }
    }

    const order = await ordersQueries.create({
      customerId,
      items: req.body.items,
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

async function listOrders(req, res, next) {
  try {
    const orders =
      req.user.role === 'owner'
        ? await ordersQueries.listAll()
        : await ordersQueries.listByDriver(req.user.id);

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await ordersQueries.findById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (!canViewOrder(req.user, order)) {
      throw new AppError('Forbidden', 403);
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
}

async function assignOrder(req, res, next) {
  try {
    const orderId = req.params.id;
    const { driver_id: driverId } = req.body;

    const order = await ordersQueries.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const driver = await usersQueries.findActiveDriverById(driverId);
    if (!driver) {
      throw new AppError('Active driver not found', 404);
    }

    const result = await ordersQueries.assignDriver(orderId, driverId);
    if (result.notFound) {
      throw new AppError('Order not found', 404);
    }
    if (result.alreadyAssigned) {
      throw new AppError('Order is already assigned to a driver', 400);
    }

    res.json({ order: result.order });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const order = await ordersQueries.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (req.user.role === 'driver') {
      if (order.assigned_driver_id !== req.user.id) {
        throw new AppError('Forbidden', 403);
      }
      assertStatusTransition(order.status, status);
    }

    const updated = await ordersQueries.updateStatus(
      orderId,
      status,
      req.user.role === 'driver' ? req.user.id : null
    );

    if (!updated) {
      throw new AppError('Order not found or not assigned to you', 403);
    }

    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  assignOrder,
  updateOrderStatus,
};
