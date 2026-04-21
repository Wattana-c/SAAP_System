const { poolPromise } = require('../configs/db');

async function initializeDatabase() {
    try {
        const pool = await poolPromise;

        // Note: In SQL Server, we can't directly check 'IF NOT EXISTS' for a table create
        // in a single simple command like Postgres or MySQL without wrapping in IF statements.
        // Or we can check if object_id is null.

        const query = `
            IF OBJECT_ID('products', 'U') IS NULL
            BEGIN
                CREATE TABLE products (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    title NVARCHAR(255) NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    image_url NVARCHAR(MAX),
                    affiliate_url NVARCHAR(MAX) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE()
                )
            END;

            IF OBJECT_ID('posts', 'U') IS NULL
            BEGIN
                CREATE TABLE posts (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    product_id INT NOT NULL,
                    caption NVARCHAR(MAX),
                    status NVARCHAR(50) DEFAULT 'pending',
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (product_id) REFERENCES products(id)
                )
            END;

            IF OBJECT_ID('schedules', 'U') IS NULL
            BEGIN
                CREATE TABLE schedules (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    post_id INT NOT NULL,
                    scheduled_time DATETIME NOT NULL,
                    status NVARCHAR(50) DEFAULT 'scheduled',
                    FOREIGN KEY (post_id) REFERENCES posts(id)
                )
            END;
        `;

        await pool.request().query(query);
        console.log('Database tables initialized successfully.');
    } catch (err) {
        console.error('Error initializing database tables:', err);
    }
}

module.exports = {
    initializeDatabase
};
