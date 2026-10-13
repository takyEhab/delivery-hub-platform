const Joi = require('joi');

const registerDriver = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  phone: Joi.string().trim().min(3).max(50).required(),
  email: Joi.string().trim().email().optional().allow(null, ''),
  password: Joi.string().min(6).max(128).required(),
});

const login = Joi.object({
  phone: Joi.string().trim().required(),
  password: Joi.string().required(),
});

const createDriver = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  phone: Joi.string().trim().min(3).max(50).required(),
  email: Joi.string().trim().email().optional().allow(null, ''),
  password: Joi.string().min(6).max(128).required(),
});

const updateDriver = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  phone: Joi.string().trim().min(3).max(50).optional(),
  email: Joi.string().trim().email().optional().allow(null, ''),
  password: Joi.string().min(6).max(128).optional(),
  is_active: Joi.boolean().optional(),
}).min(1);

const createCustomer = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  phone: Joi.string().trim().min(3).max(50).required(),
  address: Joi.string().trim().allow(null, '').optional(),
  location_url: Joi.string().trim().allow(null, '').optional(),
  notes: Joi.string().trim().allow(null, '').optional(),
});

const updateCustomer = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  phone: Joi.string().trim().min(3).max(50).optional(),
  address: Joi.string().trim().allow(null, '').optional(),
  location_url: Joi.string().trim().allow(null, '').optional(),
  notes: Joi.string().trim().allow(null, '').optional(),
}).min(1);

const createOrder = Joi.object({
  customer_id: Joi.number().integer().positive().optional(),
  customer: createCustomer.optional(),
  driver_id: Joi.number().integer().positive().allow(null).optional(),
  items: Joi.alternatives()
    .try(
      Joi.array().items(Joi.object().unknown(true)).min(1),
      Joi.string().trim().min(1)
    )
    .optional(),
  total_amount: Joi.number().min(0).optional(),
  payment_status: Joi.string().valid('unpaid', 'paid', 'postpaid').optional(),
  payment_notes: Joi.string().allow(null, '').optional(),
})
  .xor('customer_id', 'customer')
  .or('items', 'total_amount');

const assignOrder = Joi.object({
  driver_id: Joi.number().integer().positive().required(),
});

const updateOrderStatus = Joi.object({
  status: Joi.string()
    .valid('preparing', 'out_for_delivery', 'delivered')
    .required(),
  payment_status: Joi.string().valid('unpaid', 'paid', 'postpaid').optional(),
  payment_notes: Joi.string().allow(null, '').optional(),
});

const updatePaymentStatus = Joi.object({
  payment_status: Joi.string().valid('unpaid', 'paid', 'postpaid').required(),
  payment_notes: Joi.string().allow(null, '').optional(),
});

const updateOrder = Joi.object({
  customer_id: Joi.number().integer().positive().optional(),
  customer: createCustomer.optional(),
  driver_id: Joi.number().integer().positive().allow(null).optional(),
  items: Joi.alternatives()
    .try(
      Joi.array().items(Joi.object().unknown(true)).min(1),
      Joi.string().trim().min(1)
    )
    .optional(),
  total_amount: Joi.number().min(0).optional(),
  payment_status: Joi.string().valid('unpaid', 'paid', 'postpaid').optional(),
  payment_notes: Joi.string().allow(null, '').optional(),
  status: Joi.string()
    .valid('preparing', 'out_for_delivery', 'delivered')
    .optional(),
}).min(1);

const searchQuery = Joi.object({
  q: Joi.string().trim().min(1).required(),
});

module.exports = {
  registerDriver,
  login,
  createDriver,
  updateDriver,
  createCustomer,
  updateCustomer,
  createOrder,
  updateOrder,
  assignOrder,
  updateOrderStatus,
  updatePaymentStatus,
  searchQuery,
};
