const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

// Security Middlewares
app.use(helmet()); // Secure HTTP headers

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per \`window\`
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use('/api', routes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
