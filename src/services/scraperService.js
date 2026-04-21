const axios = require('axios');
const cheerio = require('cheerio');
const AppError = require('../utils/AppError');

class ScraperService {
    async scrapeShopee(affiliateUrl) {
        // Validate URL
        try {
            const parsedUrl = new URL(affiliateUrl);
            if (!parsedUrl.hostname.includes('shopee')) {
                throw new AppError('Invalid URL: Not a Shopee link', 400);
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Invalid URL provided', 400);
        }

        let retries = 3;
        while (retries > 0) {
            try {
                // Using basic headers for anti-bot
                const response = await axios.get(affiliateUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    },
                    timeout: 10000 // 10s timeout
                });

                const $ = cheerio.load(response.data);

                // Shopee renders content via JS, so traditional DOM scraping might be tricky depending on the exact page structure.
                // We'll look for common meta tags or structural elements as a best-effort approach.
                // In a real-world scenario, you might need a headless browser (Puppeteer) or to parse the inline script tags.

                let title = $('meta[property="og:title"]').attr('content') || $('title').text();
                let imageUrl = $('meta[property="og:image"]').attr('content') || '';

                // Price is usually heavily obfuscated/dynamically rendered. This is a placeholder for where price logic would go.
                // We might try to find a meta tag or a specific class if it exists in the static HTML.
                let price = $('meta[property="product:price:amount"]').attr('content') || '0.00';

                // Clean up title
                title = title ? title.replace(/\|.*/, '').trim() : 'Unknown Title';

                if (!title) {
                    throw new Error('Failed to parse title from page');
                }

                return {
                    title,
                    price: parseFloat(price) || 0,
                    image_url: imageUrl,
                    affiliate_url: affiliateUrl
                };

            } catch (error) {
                retries--;
                console.log(`Scrape attempt failed. Retries left: ${retries}. Error: ${error.message}`);
                if (retries === 0) {
                    throw new AppError(`Scraping failed after 3 attempts: ${error.message}`, 500);
                }
                // Wait for a short time before retrying
                await new Promise(res => setTimeout(res, 1000));
            }
        }
    }
}

module.exports = new ScraperService();
