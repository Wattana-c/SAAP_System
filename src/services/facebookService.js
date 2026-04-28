const axios = require('axios');
const AppError = require('../utils/AppError');

class FacebookService {
    async postToFacebook(caption, imageUrl, pageId, accessToken) {
        // Fallback to env vars if no page credentials provided (for backwards compatibility/testing)
        const fbPageId = pageId || process.env.FB_PAGE_ID;
        const fbAccessToken = accessToken || process.env.FB_PAGE_ACCESS_TOKEN;

        if (!fbPageId || !fbAccessToken) {
            throw new AppError('Facebook credentials are not configured', 500);
        }

        const url = `https://graph.facebook.com/v19.0/${fbPageId}/photos`;

        let attempts = 0;
        const maxRetries = 1; // Explicit requirement: retry once if fail (total 2 attempts)

        while (attempts <= maxRetries) {
            attempts++;
            try {
                const response = await axios.post(url, {
                    url: imageUrl,
                    message: caption,
                    access_token: fbAccessToken
                });

                return response.data; // Expected { id: 'post_id', post_id: 'page_id_post_id' }
            } catch (error) {
                const fbError = error.response?.data?.error;
                const errorMessage = fbError ? fbError.message : error.message;

                console.error(`[FacebookService] Attempt ${attempts} failed: ${errorMessage}`);

                if (attempts > maxRetries) {
                    // Throw a structured AppError containing the FB API error details
                    throw new AppError(`Facebook API Error: ${errorMessage}`, 502);
                }

                console.log(`[FacebookService] Retrying Facebook post...`);
                // Wait briefly before retrying
                await new Promise(res => setTimeout(res, 2000));
            }
        }
    }
}

module.exports = new FacebookService();
