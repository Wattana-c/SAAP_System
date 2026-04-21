const { poolPromise } = require('../configs/db');

class PostModel {
    async findAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT * FROM posts');
            return result.recordset;
        } catch (error) {
            throw new Error(`Error fetching posts: ${error.message}`);
        }
    }
}

module.exports = new PostModel();
