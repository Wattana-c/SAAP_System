const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const scraperService = require('../src/services/scraperService');
const AppError = require('../src/utils/AppError');

describe('ScraperService', () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
        // Supress console logs during tests to keep output clean
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        mock.restore();
        jest.restoreAllMocks();
    });

    const validUrl = 'https://shopee.co.th/product-123';

    it('should throw AppError for invalid URL (not Shopee)', async () => {
        const invalidUrl = 'https://example.com/product';
        await expect(scraperService.scrapeShopee(invalidUrl))
            .rejects
            .toThrow(AppError);
    });

    it('should throw AppError for completely malformed URL', async () => {
        const invalidUrl = 'not-a-url';
        await expect(scraperService.scrapeShopee(invalidUrl))
            .rejects
            .toThrow(AppError);
    });

    it('should successfully scrape and parse valid HTML', async () => {
        const mockHtml = `
            <html>
                <head>
                    <meta property="og:title" content="Test Product | Shopee Thailand">
                    <meta property="og:image" content="http://example.com/image.jpg">
                    <meta property="product:price:amount" content="฿ 1,500.50">
                </head>
            </html>
        `;

        mock.onGet(validUrl).reply(200, mockHtml);

        const result = await scraperService.scrapeShopee(validUrl);

        expect(result).toEqual({
            title: 'Test Product',
            min_price: 1500.5,
            max_price: 1500.5,
            image_url: 'http://example.com/image.jpg',
            affiliate_url: validUrl
        });
    });

    it('should successfully parse price ranges', async () => {
        const mockHtml = `
            <html>
                <head>
                    <meta property="og:title" content="Range Product | Shopee Thailand">
                    <meta property="og:image" content="http://example.com/image2.jpg">
                    <meta property="product:price:amount" content="฿ 100.00 - ฿ 200.00">
                </head>
            </html>
        `;

        const url = 'https://shopee.co.th/product-range?sp_atk=123';
        const expectedNormalizedUrl = 'https://shopee.co.th/product-range';

        mock.onGet(expectedNormalizedUrl).reply(200, mockHtml);

        const result = await scraperService.scrapeShopee(url);

        expect(result).toEqual({
            title: 'Range Product',
            min_price: 100.0,
            max_price: 200.0,
            image_url: 'http://example.com/image2.jpg',
            affiliate_url: expectedNormalizedUrl
        });
    });

    it('should fail validation (422) if title is missing', async () => {
        const mockHtml = `
            <html>
                <head>
                    <meta property="og:image" content="http://example.com/image.jpg">
                    <meta property="product:price:amount" content="100.00">
                </head>
            </html>
        `;

        mock.onGet(validUrl).reply(200, mockHtml);

        await expect(scraperService.scrapeShopee(validUrl))
            .rejects
            .toThrow(new AppError('Scraped product title is null or empty', 422));
    });

    it('should fail validation (422) if price is missing or invalid', async () => {
        const mockHtml = `
            <html>
                <head>
                    <meta property="og:title" content="Test Product">
                    <meta property="og:image" content="http://example.com/image.jpg">
                </head>
            </html>
        `;

        mock.onGet(validUrl).reply(200, mockHtml);

        await expect(scraperService.scrapeShopee(validUrl))
            .rejects
            .toThrow(new AppError('Scraped product price is invalid: 0', 422));
    });

    it('should retry on network failure and succeed', async () => {
        const mockHtml = `
            <html>
                <head>
                    <meta property="og:title" content="Test Product">
                    <meta property="og:image" content="http://example.com/image.jpg">
                    <meta property="product:price:amount" content="100.00">
                </head>
            </html>
        `;

        // Fail first two times, succeed on third
        mock.onGet(validUrl)
            .replyOnce(500)
            .onGet(validUrl)
            .replyOnce(500)
            .onGet(validUrl)
            .replyOnce(200, mockHtml);

        jest.useFakeTimers();

        const promise = scraperService.scrapeShopee(validUrl);

        await jest.runAllTimersAsync();

        const result = await promise;
        expect(result.title).toBe('Test Product');

        jest.useRealTimers();
    });

    it('should throw 500 error after 3 consecutive failures', async () => {
        mock.onGet(validUrl).reply(500);

        jest.useFakeTimers();

        const promise = scraperService.scrapeShopee(validUrl);

        // Wait for the timers to resolve before expecting the rejection
        jest.runAllTimersAsync().catch(() => {});

        await expect(promise).rejects.toThrow(/Scraping failed after 3 attempts/);

        jest.useRealTimers();
    });
});
