const postService = require('../services/postService');

class PostController {
    async getPosts(req, res, next) {
        try {
            const posts = await postService.getAllPosts();
            res.status(200).json({
                success: true,
                data: posts
            });
        } catch (error) {
            next(error);
        }
    }

    async publishPost(req, res, next) {
        try {
            const { postId } = req.params;

            const publishedPost = await postService.publishPost(postId);

            res.status(200).json({
                success: true,
                message: 'Post published to Facebook successfully',
                data: publishedPost
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PostController();
