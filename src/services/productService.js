const productModel = require('../models/productModel');
const queueService = require('./queueService');
const AppError = require('../utils/AppError');

class ProductService {
    async getAllProducts() {
        return await productModel.findAll();
    }

    async enqueueCreateProduct(url) {
        if (!url) {
            throw new AppError('URL is required', 400);
        }

        // Normalize URL for duplicate checking
        let normalizedUrl;
        try {
            const parsedUrl = new URL(url);
            if (!parsedUrl.hostname.includes('shopee')) {
                throw new AppError('Invalid URL: Not a Shopee link', 400);
            }
            normalizedUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Invalid URL provided', 400);
        }

        // Check if product already exists to prevent duplicates
        const existingProduct = await productModel.findByUrl(normalizedUrl);
        if (existingProduct) {
            throw new AppError('Product with this URL already exists', 409);
        }

        // Push the background job
        queueService.enqueueCreateProduct(normalizedUrl);
    }
}

module.exports = new ProductService();
