const clickModel = require('../models/clickModel');
const postModel = require('../models/postModel');
const AppError = require('../utils/AppError');

class RedirectController {
    async handleRedirect(req, res, next) {
        try {
            const { postId } = req.params;
            const ipAddress = req.ip || req.connection.remoteAddress;

            // 1. Fetch post and product link
            const post = await postModel.findByIdWithProduct(postId);
            if (!post || !post.affiliate_url) {
                return res.status(404).send('Not Found');
            }

            // 2. Track click in background (don't await to avoid slowing redirect)
            clickModel.create({
                post_id: postId,
                ip_address: ipAddress
            }).catch(err => console.error('[Tracking Error]', err.message));

            // 3. Redirect to Shopee affiliate link
            res.redirect(302, post.affiliate_url);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RedirectController();
