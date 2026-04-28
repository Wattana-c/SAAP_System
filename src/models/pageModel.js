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

    async getLeastRecentlyUsedPage() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT TOP 1 pg.*
                FROM pages pg
                LEFT JOIN posts p ON pg.id = p.page_id
                GROUP BY pg.id, pg.fb_page_id, pg.access_token, pg.name, pg.created_at
                ORDER BY MAX(p.created_at) ASC, NEWID()
            `);
            // Fallback to random if the query fails to return (e.g. no pages)
            return result.recordset[0] || null;
        } catch (error) {
            throw new AppError(`Database Error fetching least recently used page: ${error.message}`, 500);
        }
    }
}

module.exports = new PageModel();
