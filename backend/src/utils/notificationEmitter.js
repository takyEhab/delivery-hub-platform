const EventEmitter = require('events');

class NotificationEmitter extends EventEmitter {}

const notificationEmitter = new NotificationEmitter();
// Increase max listeners for multiple simultaneous courier connections
notificationEmitter.setMaxListeners(100);

module.exports = notificationEmitter;
