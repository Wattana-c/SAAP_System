const { poolPromise } = require('../configs/db');
const AppError = require('../utils/AppError');

class PostModel {
    async findAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT * FROM posts');
            return result.recordset;
        } catch (error) {
            throw new AppError(`Database Error: ${error.message}`, 500);
        }
    }

    async create(postData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('product_id', postData.product_id)
                .input('caption', postData.caption)
                .input('status', postData.status || 'draft')
                .query(`
                    INSERT INTO posts (product_id, caption, status)
                    OUTPUT INSERTED.*
                    VALUES (@product_id, @caption, @status)
                `);
            return result.recordset[0];
        } catch (error) {
            throw new AppError(`Database Error creating post: ${error.message}`, 500);
        }
    }
}

module.exports = new PostModel();
