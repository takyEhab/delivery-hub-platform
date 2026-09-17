const express = require('express');
const authRoutes = require('./authRoutes');
const driversRoutes = require('./driversRoutes');
const customersRoutes = require('./customersRoutes');
const ordersRoutes = require('./ordersRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/drivers', driversRoutes);
router.use('/customers', customersRoutes);
router.use('/orders', ordersRoutes);

module.exports = router;
