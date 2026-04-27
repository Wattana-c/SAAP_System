const postModel = require('../models/postModel');
const captionService = require('./captionService');
const facebookService = require('./facebookService');
const AppError = require('../utils/AppError');

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

    async publishPost(postId) {
        // 1. Get post by ID
        const post = await postModel.findByIdWithProduct(postId);
        if (!post) {
            throw new AppError('Post not found', 404);
        }

        if (post.status === 'posted') {
            throw new AppError('Post is already published', 400);
        }

        try {
            // 2. Send to Facebook
            // Note: post.image_url comes from the JOIN in postModel.findByIdWithProduct
            const fbResponse = await facebookService.postToFacebook(post.caption, post.image_url);

            // 3. Update post status to success -> 'posted'
            const updatedPost = await postModel.update(postId, {
                status: 'posted',
                fb_post_id: fbResponse.id || fbResponse.post_id // Depending on what graph API returns specifically
            });

            return updatedPost;

        } catch (error) {
            // 4. Update post status to fail -> 'failed'
            await postModel.update(postId, { status: 'failed' });

            // Re-throw so controller handles HTTP response
            throw error;
        }
    }
}

module.exports = new PostService();
