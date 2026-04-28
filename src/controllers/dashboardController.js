const clickModel = require('../models/clickModel');

class DashboardController {
    async getTopPosts(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const topPosts = await clickModel.getTopPosts(limit);

            res.status(200).json({
                success: true,
                data: topPosts
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DashboardController();
