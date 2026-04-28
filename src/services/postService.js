const postModel = require('../models/postModel');
const pageModel = require('../models/pageModel');
const captionService = require('./captionService');
const facebookService = require('./facebookService');
const AppError = require('../utils/AppError');

class PostService {
    async getAllPosts() {
        return await postModel.findAll();
    }

    async createPostForProduct(product) {
        // 1. Pick a random page (for multi-page support)
        const randomPage = await pageModel.getRandomPage();
        const pageId = randomPage ? randomPage.id : null;

        // 2. Create the post record first to get an ID for the redirect link
        const postData = {
            product_id: product.id,
            page_id: pageId,
            caption: '', // Will be updated
            status: 'draft'
        };
        const newPost = await postModel.create(postData);

        // 3. Construct redirect link
        const redirectLink = `${process.env.FRONTEND_URL}/r/${newPost.id}`;

        // 4. Generate highly persuasive caption via AI
        const caption = await captionService.generateCaption(
            product.title,
            product.min_price,
            product.max_price,
            redirectLink
        );

        // 5. Update the post with the generated caption
        const updatedPost = await postModel.update(newPost.id, { caption: caption });
        return updatedPost;
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
            // Note: image_url, fb_page_id, page_access_token come from the JOIN in postModel.findByIdWithProduct
            const fbResponse = await facebookService.postToFacebook(
                post.caption,
                post.image_url,
                post.fb_page_id, // Might be null if no pages exist, falls back to env in facebookService
                post.page_access_token
            );

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
