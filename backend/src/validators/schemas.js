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
  notes: Joi.string().trim().allow(null, '').optional(),
});

const updateCustomer = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  phone: Joi.string().trim().min(3).max(50).optional(),
  address: Joi.string().trim().allow(null, '').optional(),
  notes: Joi.string().trim().allow(null, '').optional(),
}).min(1);

const createOrder = Joi.object({
  customer_id: Joi.number().integer().positive().optional(),
  customer: createCustomer.optional(),
  items: Joi.alternatives()
    .try(
      Joi.array().items(Joi.object().unknown(true)).min(1),
      Joi.string().trim().min(1)
    )
    .required(),
}).xor('customer_id', 'customer');

const assignOrder = Joi.object({
  driver_id: Joi.number().integer().positive().required(),
});

const updateOrderStatus = Joi.object({
  status: Joi.string()
    .valid('preparing', 'out_for_delivery', 'delivered')
    .required(),
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
  searchQuery,
};
