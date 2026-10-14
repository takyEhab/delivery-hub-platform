const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const notificationEmitter = require('../utils/notificationEmitter');

const router = express.Router();

/**
 * SSE endpoint for real-time notifications for couriers
 * Connects when driver is logged in, disconnects when logged out.
 */
router.get('/stream', authenticate, authorize('driver'), (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx/proxies

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', userId: req.user.id })}\n\n`);

  const onOrderAssigned = (data) => {
    if (data.driverId === req.user.id) {
      res.write(`data: ${JSON.stringify({ type: 'order_assigned', order: data.order })}\n\n`);
    }
  };

  notificationEmitter.on('order_assigned', onOrderAssigned);

  // Send keep-alive comment every 25 seconds to prevent timeout
  const keepAliveInterval = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    notificationEmitter.off('order_assigned', onOrderAssigned);
  });
});

module.exports = router;
