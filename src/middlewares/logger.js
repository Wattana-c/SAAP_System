const morgan = require('morgan');

// We use the dev format for logging requests
const logger = morgan('dev');

module.exports = logger;
