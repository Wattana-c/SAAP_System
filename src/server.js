require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./models/initDb');
const { poolPromise } = require('./configs/db');
const scheduleWorker = require('./workers/scheduleWorker');
const optimizationWorker = require('./workers/optimizationWorker');

const PORT = process.env.PORT || 3000;
let server;

async function startServer() {
    try {
        // Initialize Database Tables
        await initializeDatabase();

        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
        });

        // Start background workers
        scheduleWorker.start();
        optimizationWorker.start();
    } catch (err) {
        console.error('Failed to start server:', err);
    }
}

startServer();

// Graceful shutdown mechanism
async function gracefulShutdown(signal) {
    console.log(`\n${signal} signal received: closing HTTP server`);
    scheduleWorker.stop();
    optimizationWorker.stop();

    if (server) {
        server.close(async () => {
            console.log('HTTP server closed');
            try {
                const pool = await poolPromise;
                await pool.close();
                console.log('MSSQL connection pool closed.');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MSSQL connection pool:', err);
                process.exit(1);
            }
        });
    } else {
        process.exit(0);
    }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
