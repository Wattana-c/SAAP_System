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

    async findByUrl(affiliateUrl) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('affiliate_url', sql.NVarChar(sql.MAX), affiliateUrl)
                .query('SELECT TOP 1 * FROM products WHERE affiliate_url = @affiliate_url');
            return result.recordset[0];
        } catch (error) {
            throw new AppError(`Database Error fetching product by URL: ${error.message}`, 500);
        }
    }

    async create(productData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('title', sql.NVarChar(255), productData.title)
                .input('min_price', sql.Decimal(10, 2), productData.min_price)
                .input('max_price', sql.Decimal(10, 2), productData.max_price)
                .input('image_url', sql.NVarChar(sql.MAX), productData.image_url)
                .input('affiliate_url', sql.NVarChar(sql.MAX), productData.affiliate_url)
                .query(`
                    INSERT INTO products (title, min_price, max_price, image_url, affiliate_url)
                    OUTPUT INSERTED.*
                    VALUES (@title, @min_price, @max_price, @image_url, @affiliate_url)
                `);
            return result.recordset[0];
        } catch (error) {
            throw new AppError(`Database Error creating product: ${error.message}`, 500);
        }
    }
}

module.exports = new ProductModel();
