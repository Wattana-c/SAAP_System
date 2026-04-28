const productModel = require('../models/productModel');
const postService = require('./postService');
const scheduleService = require('./scheduleService');

class TrafficService {
    /**
     * Re-ingests top performing products (Top 10% by CTR score) back into the
     * pipeline to create fresh caption variations and repost them on a delay.
     */
    async processTopProductLoop() {
        console.log('[TrafficService] Starting Top Product Loop process...');

        try {
            // 1. Identify top 10% highest CTR products
            const topProducts = await productModel.getTop10PercentProducts();

            if (!topProducts || topProducts.length === 0) {
                console.log('[TrafficService] No profitable top products found to loop.');
                return;
            }

            console.log(`[TrafficService] Found ${topProducts.length} top products. Generating reposts...`);

            // 2. Generate new captions and schedule them
            for (const product of topProducts) {
                try {
                    // postService.createPostForProduct now correctly uses getLeastRecentlyUsedPage()
                    // and generates 3 new distinct captions via OpenAI JSON format.
                    const newPosts = await postService.createPostForProduct(product);

                    // 3. Schedule the repost between 24 and 72 hours (1440 mins to 4320 mins)
                    for (const post of newPosts) {
                        const minDelayMins = 1440; // 24h
                        const maxDelayMins = 4320; // 72h
                        await scheduleService.schedulePost(post.id, minDelayMins, maxDelayMins);
                    }
                    console.log(`[TrafficService] Successfully queued reposts for product: ${product.title}`);
                } catch (err) {
                    console.error(`[TrafficService] Failed to process product loop for ID ${product.id}:`, err.message);
                }
            }

            console.log('[TrafficService] Top Product Loop completed.');
        } catch (error) {
            console.error('[TrafficService] Critical error during Top Product Loop:', error.message);
        }
    }
}

module.exports = new TrafficService();
