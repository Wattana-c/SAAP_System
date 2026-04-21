require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./models/initDb');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Initialize Database Tables
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
}

startServer();
