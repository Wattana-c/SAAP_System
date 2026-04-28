const { poolPromise, sql } = require('../configs/db');
const AppError = require('../utils/AppError');

class PageModel {
    async findAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT * FROM pages');
            return result.recordset;
        } catch (error) {
            throw new AppError(`Database Error fetching pages: ${error.message}`, 500);
        }
    }

    async getRandomPage() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT TOP 1 * FROM pages ORDER BY NEWID()');
            return result.recordset[0];
        } catch (error) {
            throw new AppError(`Database Error fetching random page: ${error.message}`, 500);
        }
    }
}

module.exports = new PageModel();
