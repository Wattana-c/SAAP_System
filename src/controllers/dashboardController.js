const clickModel = require('../models/clickModel');
const postModel = require('../models/postModel');
const productModel = require('../models/productModel');

class DashboardController {
    async getDashboardStats(req, res, next) {
        try {
            const dailyStats = await postModel.getDailyStats();
            const topPosts = await clickModel.getTopPosts(5);
            // Reusing the getTop10PercentProducts to find top profitable products
            const topProducts = await productModel.getTop10PercentProducts();

            res.status(200).json({
                success: true,
                data: {
                    daily_stats: dailyStats,
                    top_posts: topPosts,
                    top_products: topProducts.slice(0, 5) // Return top 5
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DashboardController();
