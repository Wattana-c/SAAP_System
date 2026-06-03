const { poolPromise } = require('../configs/db');
const AppError = require('../utils/AppError');

class ClickModel {
    async create(clickData) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('post_id', clickData.post_id)
                .input('ip_address', clickData.ip_address || null)
                .query(`
                    INSERT INTO clicks (post_id, ip_address)
                    VALUES (@post_id, @ip_address)
                `);
            return true;
        } catch (error) {
            throw new AppError(`Database Error creating click: ${error.message}`, 500);
        }
    }

    async getTopPosts(limit = 10) {
        try {
            const pool = await poolPromise;
            // Get top posts by click count, calculate basic CTR
            const result = await pool.request()
                .input('limit', limit)
                .query(`
                    SELECT TOP (@limit)
                        p.id as post_id,
                        p.ab_version,
                        p.caption,
                        p.status,
                        pr.title as product_title,
                        pr.affiliate_url,
                        COUNT(c.id) as clicks,
                        -- Assume 1 post = 1 impression for a simplistic CTR proxy in this model
                        CAST(COUNT(c.id) AS FLOAT) / 1.0 as ctr
                    FROM posts p
                    JOIN products pr ON p.product_id = pr.id
                    LEFT JOIN clicks c ON p.id = c.post_id
                    GROUP BY p.id, p.ab_version, p.caption, p.status, pr.title, pr.affiliate_url
                    ORDER BY clicks DESC
                `);
            return result.recordset;
        } catch (error) {
            throw new AppError(`Database Error fetching top posts: ${error.message}`, 500);
        }
    }
}

module.exports = new ClickModel();
