const axios = require('axios');
const cheerio = require('cheerio');
const AppError = require('../utils/AppError');

class ScraperService {
    async scrapeShopee(affiliateUrl) {
        let normalizedUrl;
        // Validate and normalize URL
        try {
            const parsedUrl = new URL(affiliateUrl);
            if (!parsedUrl.hostname.includes('shopee')) {
                throw new AppError('Invalid URL: Not a Shopee link', 400);
            }
            // Strip query parameters to prevent duplicates and simplify scraping
            normalizedUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Invalid URL provided', 400);
        }

        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            attempt++;
            try {
                console.log(`[Scraper] Attempt ${attempt}: Scraping ${normalizedUrl}`);
                const response = await axios.get(normalizedUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    },
                    timeout: 10000 // 10s timeout to prevent hanging requests
                });

                const $ = cheerio.load(response.data);

                let title = $('meta[property="og:title"]').attr('content') || $('title').text();
                let imageUrl = $('meta[property="og:image"]').attr('content') || '';
                let rawPrice = $('meta[property="product:price:amount"]').attr('content') || '0';

                title = title ? title.replace(/\|.*/, '').trim() : '';

                // Parse Price - handle potential ranges (e.g. 100 - 200)
                let minPrice = 0;
                let maxPrice = 0;

                const numericPriceMatches = rawPrice.match(/[\d,.]+/g);
                if (numericPriceMatches && numericPriceMatches.length > 0) {
                    minPrice = parseFloat(numericPriceMatches[0].replace(/,/g, ''));
                    if (numericPriceMatches.length > 1) {
                        maxPrice = parseFloat(numericPriceMatches[1].replace(/,/g, ''));
                    } else {
                        maxPrice = minPrice;
                    }
                }

                if (!title) {
                    throw new AppError('Scraped product title is null or empty', 422);
                }
                if (!imageUrl) {
                    throw new AppError('Scraped product image URL is null or empty', 422);
                }
                if (isNaN(minPrice) || minPrice <= 0 || isNaN(maxPrice) || maxPrice <= 0) {
                    throw new AppError(`Scraped product price is invalid: ${rawPrice}`, 422);
                }

                console.log(`[Scraper] Success: Scraped "${title}"`);
                return {
                    title,
                    min_price: minPrice,
                    max_price: maxPrice,
                    image_url: imageUrl,
                    affiliate_url: normalizedUrl
                };

            } catch (error) {
                console.error(`[Scraper] Attempt ${attempt} failed: ${error.message}`);
                if (error instanceof AppError && error.statusCode === 422) {
                    throw error;
                }

                if (attempt === maxRetries) {
                    throw new AppError(`Scraping failed after ${maxRetries} attempts: ${error.message}`, 500);
                }
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`[Scraper] Waiting ${delay}ms before next attempt...`);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }
}

module.exports = new ScraperService();
