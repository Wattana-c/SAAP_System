const { poolPromise } = require('../configs/db');

async function initializeDatabase() {
    try {
        const pool = await poolPromise;

        // Note: In SQL Server, we can't directly check 'IF NOT EXISTS' for a table create
        // in a single simple command like Postgres or MySQL without wrapping in IF statements.
        // Or we can check if object_id is null.

        const query = `
            IF OBJECT_ID('pages', 'U') IS NULL
            BEGIN
                CREATE TABLE pages (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    fb_page_id NVARCHAR(255) NOT NULL,
                    access_token NVARCHAR(MAX) NOT NULL,
                    name NVARCHAR(255),
                    created_at DATETIME DEFAULT GETDATE()
                )
            END;

            IF OBJECT_ID('products', 'U') IS NULL
            BEGIN
                CREATE TABLE products (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    title NVARCHAR(255) NOT NULL,
                    min_price DECIMAL(10, 2) NOT NULL,
                    max_price DECIMAL(10, 2) NOT NULL,
                    image_url NVARCHAR(MAX),
                    affiliate_url NVARCHAR(MAX) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE()
                )
            END
            ELSE
            BEGIN
                -- Add min_price and max_price if they do not exist
                IF COL_LENGTH('products', 'min_price') IS NULL
                BEGIN
                    ALTER TABLE products ADD min_price DECIMAL(10, 2) DEFAULT 0 NOT NULL;
                END

                IF COL_LENGTH('products', 'max_price') IS NULL
                BEGIN
                    ALTER TABLE products ADD max_price DECIMAL(10, 2) DEFAULT 0 NOT NULL;
                END
            END;

            IF OBJECT_ID('posts', 'U') IS NULL
            BEGIN
                CREATE TABLE posts (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    product_id INT NOT NULL,
                    page_id INT,
                    caption NVARCHAR(MAX),
                    status NVARCHAR(50) DEFAULT 'pending',
                    fb_post_id NVARCHAR(255),
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (product_id) REFERENCES products(id),
                    FOREIGN KEY (page_id) REFERENCES pages(id)
                )
            END
            ELSE
            BEGIN
                -- Add fb_post_id if it does not exist
                IF COL_LENGTH('posts', 'fb_post_id') IS NULL
                BEGIN
                    ALTER TABLE posts ADD fb_post_id NVARCHAR(255) NULL;
                END
                -- Add page_id if it does not exist
                IF COL_LENGTH('posts', 'page_id') IS NULL
                BEGIN
                    ALTER TABLE posts ADD page_id INT NULL;
                    ALTER TABLE posts ADD CONSTRAINT FK_posts_pages FOREIGN KEY (page_id) REFERENCES pages(id);
                END
            END;

            IF OBJECT_ID('clicks', 'U') IS NULL
            BEGIN
                CREATE TABLE clicks (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    post_id INT NOT NULL,
                    ip_address NVARCHAR(50),
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (post_id) REFERENCES posts(id)
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
