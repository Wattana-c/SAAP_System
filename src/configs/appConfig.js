require('dotenv').config();

class AppConfig {
    constructor() {
        this.config = {
            ENABLE_AUTOMATION: process.env.ENABLE_AUTOMATION !== 'false',
            MAX_POSTS_PER_DAY: parseInt(process.env.MAX_POSTS_PER_DAY) || 50,
            POSTING_TIME_WINDOWS: process.env.POSTING_TIME_WINDOWS || '08:00-22:00',
            ENABLE_TOP_PRODUCT_LOOP: process.env.ENABLE_TOP_PRODUCT_LOOP !== 'false',
            ENABLE_AI_CAPTION: process.env.ENABLE_AI_CAPTION !== 'false',
            ENABLE_MULTI_PAGE: process.env.ENABLE_MULTI_PAGE !== 'false',
            RETRY_LIMIT: parseInt(process.env.RETRY_LIMIT) || 3,
            QUEUE_CONCURRENCY: parseInt(process.env.QUEUE_CONCURRENCY) || 1,
            SAFE_MODE_ERROR_THRESHOLD: parseInt(process.env.SAFE_MODE_ERROR_THRESHOLD) || 5
        };
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        if (this.config.hasOwnProperty(key)) {
            // Type coercion based on existing type
            const existingType = typeof this.config[key];
            if (existingType === 'boolean') {
                this.config[key] = value === 'true' || value === true;
            } else if (existingType === 'number') {
                this.config[key] = parseInt(value, 10);
            } else {
                this.config[key] = value;
            }
        }
    }

    getAll() {
        return { ...this.config };
    }
}

module.exports = new AppConfig();
