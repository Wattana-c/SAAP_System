const { poolPromise } = require('../configs/db');

class ProductModel {
    async findAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT * FROM products');
            return result.recordset;
        } catch (error) {
            throw new Error(`Error fetching products: ${error.message}`);
        }
    }
}

module.exports = new ProductModel();
