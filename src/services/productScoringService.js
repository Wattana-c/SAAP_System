const { poolPromise } = require('../configs/db');
const AppError = require('../utils/AppError');

class ProductScoringService {
    /**
     * Re-calculates and updates the scores for all products based on their post performance.
     * Simple scoring algorithm: Total Clicks + Recent CTR factor.
     */
    async updateAllScores() {
        try {
            console.log('[ProductScoring] Updating product scores...');
            const pool = await poolPromise;

            // Calculate score using a proxy for CTR: (Total Clicks / Total Posts Generated)
            // Multiplying by a weight factor (e.g., 100) for readability
            await pool.request().query(`
                UPDATE pr
                SET pr.score = ISNULL(sub.calculated_score, 0)
                FROM products pr
                LEFT JOIN (
                    SELECT
                        p.product_id,
                        COUNT(DISTINCT p.id) as total_posts,
                        COUNT(c.id) as total_clicks,
                        (CAST(COUNT(c.id) AS DECIMAL(10,2)) / NULLIF(COUNT(DISTINCT p.id), 0)) * 100 as calculated_score
                    FROM posts p
                    LEFT JOIN clicks c ON p.id = c.post_id
                    GROUP BY p.product_id
                ) sub ON pr.id = sub.product_id
            `);

            console.log('[ProductScoring] Product scores updated successfully.');
        } catch (error) {
            console.error('[ProductScoring] Failed to update scores:', error.message);
        }
    }

    /**
     * Fetch products ordered by score to determine profitable products for automation.
     */
    async getSmartProducts(limit = 20) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('limit', limit)
                .query(`
                    SELECT TOP (@limit) *
                    FROM products
                    ORDER BY score DESC, created_at DESC
                `);
            return result.recordset;
        } catch (error) {
            throw new AppError(`Database Error fetching smart products: ${error.message}`, 500);
        }
    }
}

module.exports = new ProductScoringService();
