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
}

module.exports = new PostController();
