const productModel = require('../models/productModel');

class ProductService {
    async getAllProducts() {
        // Business logic can be added here
        return await productModel.findAll();
    }
}

module.exports = new ProductService();
