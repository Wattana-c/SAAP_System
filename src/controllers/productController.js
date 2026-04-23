const productService = require('../services/productService');

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

    async createProduct(req, res, next) {
        try {
            const { url } = req.body;

            const newProduct = await productService.createProduct(url);

            res.status(201).json({
                success: true,
                message: 'Product scraped and saved successfully',
                data: newProduct
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
