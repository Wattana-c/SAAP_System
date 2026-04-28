const productService = require('../services/productService');
const productScoringService = require('../services/productScoringService');

class ProductController {
    async getProducts(req, res, next) {
        try {
            const products = await productService.getAllProducts();
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }

    async getSmartProducts(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const products = await productScoringService.getSmartProducts(limit);
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }

    async createProduct(req, res, next) {
        try {
            const { url } = req.body;

            await productService.enqueueCreateProduct(url);

            res.status(202).json({
                success: true,
                message: 'Product creation job queued successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
