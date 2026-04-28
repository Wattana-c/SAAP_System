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
        // 1. Pick least recently used page to intelligently rotate distribution
        const rotatedPage = await pageModel.getLeastRecentlyUsedPage();
        const pageId = rotatedPage ? rotatedPage.id : null;

        // Fetch dynamic guidelines optimized by AI
        const systemConfigModel = require('../models/systemConfigModel');
        const additionalGuidelines = await systemConfigModel.getConfig('AI_CAPTION_GUIDELINES') || '';

        // 2. Generate highly persuasive captions via AI (3 Variations for A/B Testing with {{LINK}} placeholders)
        const captions = await captionService.generateCaption(
            product.title,
            product.min_price,
            product.max_price,
            additionalGuidelines
        );

        // Helper function to create a post and inject its unique redirect link
        const createPostWithLink = async (captionTemplate, abVersion) => {
            // Create draft to get an ID
            const draft = await postModel.create({
                product_id: product.id,
                page_id: pageId,
                caption: '', // Will update immediately after
                status: 'draft',
                ab_version: abVersion
            });

            // Generate unique redirect link for this specific post
            const redirectLink = `${process.env.FRONTEND_URL}/r/${draft.id}`;
            const finalizedCaption = captionTemplate.replace('{{LINK}}', redirectLink);

            // Update draft with injected link
            return await postModel.update(draft.id, { caption: finalizedCaption, ab_version: abVersion });
        };

        // 3. Create three unique posts for A/B testing
        const postA = await createPostWithLink(captions.A, 'A');
        const postB = await createPostWithLink(captions.B, 'B');
        const postC = await createPostWithLink(captions.C, 'C');

        return [postA, postB, postC];
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
