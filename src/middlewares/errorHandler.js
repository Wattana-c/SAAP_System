const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        });
    } else {
        // Production
        if (err.isOperational) {
            // Known operational error
            res.status(err.statusCode).json({
                success: false,
                status: err.status,
                message: err.message
            });
        } else {
            // Programming or other unknown error: don't leak details
            console.error('ERROR 💥', err);
            res.status(500).json({
                success: false,
                status: 'error',
                message: 'Something went very wrong!'
            });
        }
    }
};

module.exports = errorHandler;
