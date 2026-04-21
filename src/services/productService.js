const productModel = require('../models/productModel');
const scraperService = require('./scraperService');
const AppError = require('../utils/AppError');

class ProductService {
    async getAllProducts() {
        return await productModel.findAll();
    }

    async createProduct(url) {
        if (!url) {
            throw new AppError('URL is required', 400);
        }

        // 1. Scrape data
        const scrapedData = await scraperService.scrapeShopee(url);

        // 2. Save to DB
        const newProduct = await productModel.create(scrapedData);

        return newProduct;
    }
}

module.exports = new ProductService();
