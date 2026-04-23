const { poolPromise } = require('../configs/db');
const AppError = require('../utils/AppError');

class PostModel {
    async findAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT * FROM posts');
            return result.recordset;
        } catch (error) {
            throw new AppError(\`Database Error: \${error.message}\`, 500);
        }
    }
}

module.exports = new PostModel();
