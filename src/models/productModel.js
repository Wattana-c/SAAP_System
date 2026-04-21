const { poolPromise, sql } = require('../configs/db');
const AppError = require('../utils/AppError');

class ProductModel {
    async findAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT * FROM products');
            return result.recordset;
        } catch (error) {
            throw new AppError(`Database Error: ${error.message}`, 500);
        }
    }

    async create(productData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('title', sql.NVarChar(255), productData.title)
                .input('price', sql.Decimal(10, 2), productData.price)
                .input('image_url', sql.NVarChar(sql.MAX), productData.image_url)
                .input('affiliate_url', sql.NVarChar(sql.MAX), productData.affiliate_url)
                .query(`
                    INSERT INTO products (title, price, image_url, affiliate_url)
                    OUTPUT INSERTED.*
                    VALUES (@title, @price, @image_url, @affiliate_url)
                `);
            return result.recordset[0];
        } catch (error) {
            throw new AppError(`Database Error creating product: ${error.message}`, 500);
        }
    }
}

module.exports = new ProductModel();
