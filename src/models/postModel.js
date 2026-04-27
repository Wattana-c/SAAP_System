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

    async findByIdWithProduct(id) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', id)
                .query(`
                    SELECT p.*, pr.image_url, pr.affiliate_url
                    FROM posts p
                    JOIN products pr ON p.product_id = pr.id
                    WHERE p.id = @id
                `);
            return result.recordset[0];
        } catch (error) {
            throw new AppError(`Database Error fetching post: ${error.message}`, 500);
        }
    }

    async update(id, updateData) {
        try {
            const pool = await poolPromise;
            let query = 'UPDATE posts SET ';
            const request = pool.request().input('id', id);

            const updates = [];
            if (updateData.status) {
                updates.push('status = @status');
                request.input('status', updateData.status);
            }
            if (updateData.fb_post_id) {
                updates.push('fb_post_id = @fb_post_id');
                request.input('fb_post_id', updateData.fb_post_id);
            }

            if (updates.length === 0) return null;

            query += updates.join(', ') + ' OUTPUT INSERTED.* WHERE id = @id';

            const result = await request.query(query);
            return result.recordset[0];
        } catch (error) {
            throw new AppError(`Database Error updating post: ${error.message}`, 500);
        }
    }
}

module.exports = new PostModel();
