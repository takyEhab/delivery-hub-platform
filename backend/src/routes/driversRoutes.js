const express = require('express');
const driversController = require('../controllers/driversController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createDriver, updateDriver } = require('../validators/schemas');

const router = express.Router();

router.use(authenticate, authorize('owner'));

router.get('/', driversController.listDrivers);
router.post('/', validate(createDriver), driversController.createDriver);
router.patch('/:id', validate(updateDriver), driversController.updateDriver);
router.delete('/:id', driversController.deleteDriver);

module.exports = router;
