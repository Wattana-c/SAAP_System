const postModel = require('../models/postModel');
const captionService = require('./captionService');

class PostService {
    async getAllPosts() {
        return await postModel.findAll();
    }

    async createPostForProduct(product) {
        // Generate Thai caption via AI / Template
        const caption = captionService.generateCaption(product.title, product.min_price, product.max_price);

        // Save post as draft
        const postData = {
            product_id: product.id,
            caption: caption,
            status: 'draft'
        };

        const newPost = await postModel.create(postData);
        return newPost;
    }
}

module.exports = new PostService();
