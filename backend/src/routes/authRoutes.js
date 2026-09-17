const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerDriver, login } = require('../validators/schemas');

const router = express.Router();

router.post(
  '/register',
  authenticate,
  authorize('owner'),
  validate(registerDriver),
  authController.registerDriver
);

router.post('/login', validate(login), authController.login);

module.exports = router;
