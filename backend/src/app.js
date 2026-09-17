const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { FRONTEND_URL } = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({
    origin: FRONTEND_URL || "https://delivery-hub-platform.vercel.app",
    credentials: true
}));

app.use(express.json());
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
