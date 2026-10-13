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
      const existing = await customersQueries.findByPhone(req.body.customer.phone);
      if (existing) {
        customerId = existing.id;
        const updates = {};
        if (req.body.customer.address && !existing.address) {
          updates.address = req.body.customer.address;
        }
        if (req.body.customer.location_url && !existing.location_url) {
          updates.location_url = req.body.customer.location_url;
        }
        if (Object.keys(updates).length > 0) {
          await customersQueries.update(existing.id, updates);
        }
      } else {
        const created = await customersQueries.create(req.body.customer);
        customerId = created.id;
      }
    } else {
      const customer = await customersQueries.findById(customerId);
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }
    }

    const order = await ordersQueries.create({
      customerId,
      items: req.body.items,
      totalAmount: req.body.total_amount,
      paymentStatus: req.body.payment_status,
      paymentNotes: req.body.payment_notes,
      driverId: req.body.driver_id ? Number(req.body.driver_id) : null,
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
    const { status, payment_status: paymentStatus, payment_notes: paymentNotes } = req.body;

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
      req.user.role === 'driver' ? req.user.id : null,
      { paymentStatus, paymentNotes }
    );

    if (!updated) {
      throw new AppError('Order not found or not assigned to you', 403);
    }

    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
}

async function updatePaymentStatus(req, res, next) {
  try {
    const orderId = req.params.id;
    const { payment_status: paymentStatus, payment_notes: paymentNotes } = req.body;

    const order = await ordersQueries.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (req.user.role === 'driver' && order.assigned_driver_id !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }

    const updated = await ordersQueries.updatePayment(orderId, {
      paymentStatus,
      paymentNotes,
    });

    if (!updated) {
      throw new AppError('Order not found', 404);
    }

    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
}

async function updateOrder(req, res, next) {
  try {
    const orderId = req.params.id;
    const existing = await ordersQueries.findById(orderId);
    if (!existing) {
      throw new AppError('Order not found', 404);
    }

    let customerId = req.body.customer_id;
    if (req.body.customer) {
      const created = await customersQueries.create(req.body.customer);
      customerId = created.id;
    }

    let driverId = req.body.driver_id;
    if (driverId !== undefined && driverId !== null) {
      const driver = await usersQueries.findActiveDriverById(driverId);
      if (!driver) {
        throw new AppError('Active driver not found', 404);
      }
    }

    const updated = await ordersQueries.update(orderId, {
      customerId,
      assignedDriverId: driverId,
      items: req.body.items,
      status: req.body.status,
      totalAmount: req.body.total_amount,
      paymentStatus: req.body.payment_status,
      paymentNotes: req.body.payment_notes,
    });

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
  updatePaymentStatus,
  updateOrder,
};
