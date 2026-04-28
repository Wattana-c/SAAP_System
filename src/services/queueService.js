const scraperService = require('./scraperService');
const productModel = require('../models/productModel');
const postService = require('./postService');
const scheduleService = require('./scheduleService');

class QueueService {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    enqueueCreateProduct(url) {
        this.queue.push(url);
        console.log(`[Queue] Job enqueued. Queue length: ${this.queue.length}`);

        // Start processing if not already doing so
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const url = this.queue.shift();
            console.log(`[Queue] Processing job for URL: ${url}`);

            try {
                // 1. Scrape Data
                const scrapedData = await scraperService.scrapeShopee(url);

                // 2. Save Product to DB
                const newProduct = await productModel.create(scrapedData);
                console.log(`[Queue] Product successfully created: ${newProduct.title}`);

                // 3. Generate A/B Captions and Save Draft Posts
                const newPosts = await postService.createPostForProduct(newProduct);
                console.log(`[Queue] Draft posts (A/B/C) generated and saved for URL: ${url}`);

                // 4. Schedule Posts (Full Auto Mode)
                for (const post of newPosts) {
                    await scheduleService.schedulePost(post.id);
                }
            } catch (error) {
                console.error(`[Queue] Job failed for URL: ${url}. Error: ${error.message}`);
                // Implement further retry logic or dead-letter queue if necessary
            }
        }

        this.isProcessing = false;
        console.log(`[Queue] All jobs processed. Queue is empty.`);
    }
}

module.exports = new QueueService();
