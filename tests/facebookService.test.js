const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const facebookService = require('../src/services/facebookService');
const AppError = require('../src/utils/AppError');

describe('FacebookService', () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        // Mock environment variables
        process.env.FB_PAGE_ID = 'test_page_id';
        process.env.FB_PAGE_ACCESS_TOKEN = 'test_token';
    });

    afterEach(() => {
        mock.restore();
        jest.restoreAllMocks();
        delete process.env.FB_PAGE_ID;
        delete process.env.FB_PAGE_ACCESS_TOKEN;
    });

    it('should throw 500 error if environment variables are not set', async () => {
        delete process.env.FB_PAGE_ID;
        await expect(facebookService.postToFacebook('Test caption', 'http://image.url'))
            .rejects
            .toThrow(new AppError('Facebook credentials are not configured', 500));
    });

    it('should successfully post to Facebook on first attempt', async () => {
        const mockResponse = { id: '123_456' };
        mock.onPost('https://graph.facebook.com/v19.0/test_page_id/photos').reply(200, mockResponse);

        const result = await facebookService.postToFacebook('Test caption', 'http://image.url');
        expect(result).toEqual(mockResponse);
    });

    it('should retry once on failure and succeed', async () => {
        const mockResponse = { id: '123_456' };
        mock.onPost('https://graph.facebook.com/v19.0/test_page_id/photos')
            .replyOnce(400, { error: { message: 'Invalid token' } })
            .onPost('https://graph.facebook.com/v19.0/test_page_id/photos')
            .replyOnce(200, mockResponse);

        jest.useFakeTimers();

        const promise = facebookService.postToFacebook('Test caption', 'http://image.url');

        await jest.runAllTimersAsync();

        const result = await promise;
        expect(result).toEqual(mockResponse);

        jest.useRealTimers();
    });

    it('should fail and throw AppError 502 after 2 total attempts', async () => {
        mock.onPost('https://graph.facebook.com/v19.0/test_page_id/photos')
            .reply(400, { error: { message: 'Invalid OAuth access token.' } });

        jest.useFakeTimers();

        const promise = facebookService.postToFacebook('Test caption', 'http://image.url');

        jest.runAllTimersAsync().catch(() => {});

        await expect(promise).rejects.toThrow(new AppError('Facebook API Error: Invalid OAuth access token.', 502));

        // Verify it was only retried once (2 total calls)
        expect(mock.history.post.length).toBe(2);

        jest.useRealTimers();
    });
});
