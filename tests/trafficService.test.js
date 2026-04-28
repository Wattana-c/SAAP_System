const trafficService = require('../src/services/trafficService');
const productModel = require('../src/models/productModel');
const postService = require('../src/services/postService');
const scheduleService = require('../src/services/scheduleService');

jest.mock('../src/models/productModel');
jest.mock('../src/services/postService');
jest.mock('../src/services/scheduleService');

describe('TrafficService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should not do anything if there are no top products', async () => {
        productModel.getTop10PercentProducts.mockResolvedValue([]);

        await trafficService.processTopProductLoop();

        expect(productModel.getTop10PercentProducts).toHaveBeenCalledTimes(1);
        expect(postService.createPostForProduct).not.toHaveBeenCalled();
        expect(scheduleService.schedulePost).not.toHaveBeenCalled();
    });

    it('should generate new posts and schedule them between 24 and 72 hours for top products', async () => {
        const mockProducts = [
            { id: 101, title: 'Winning Product A' }
        ];

        const mockNewPosts = [
            { id: 1 },
            { id: 2 },
            { id: 3 }
        ];

        productModel.getTop10PercentProducts.mockResolvedValue(mockProducts);
        postService.createPostForProduct.mockResolvedValue(mockNewPosts);
        scheduleService.schedulePost.mockResolvedValue(true);

        await trafficService.processTopProductLoop();

        expect(productModel.getTop10PercentProducts).toHaveBeenCalledTimes(1);

        expect(postService.createPostForProduct).toHaveBeenCalledTimes(1);
        expect(postService.createPostForProduct).toHaveBeenCalledWith(mockProducts[0]);

        expect(scheduleService.schedulePost).toHaveBeenCalledTimes(3);

        // Assert that the scheduling bounds are exactly 24h (1440 mins) to 72h (4320 mins)
        expect(scheduleService.schedulePost).toHaveBeenCalledWith(1, 1440, 4320);
        expect(scheduleService.schedulePost).toHaveBeenCalledWith(2, 1440, 4320);
        expect(scheduleService.schedulePost).toHaveBeenCalledWith(3, 1440, 4320);
    });

    it('should continue processing even if one product generation fails', async () => {
        const mockProducts = [
            { id: 101, title: 'Winning Product A' },
            { id: 102, title: 'Winning Product B' }
        ];

        const mockNewPosts = [{ id: 99 }];

        productModel.getTop10PercentProducts.mockResolvedValue(mockProducts);

        // First fails, second succeeds
        postService.createPostForProduct
            .mockRejectedValueOnce(new Error('API Rate Limit'))
            .mockResolvedValueOnce(mockNewPosts);

        scheduleService.schedulePost.mockResolvedValue(true);

        await trafficService.processTopProductLoop();

        expect(productModel.getTop10PercentProducts).toHaveBeenCalledTimes(1);
        expect(postService.createPostForProduct).toHaveBeenCalledTimes(2);

        // Should only schedule the successful one
        expect(scheduleService.schedulePost).toHaveBeenCalledTimes(1);
        expect(scheduleService.schedulePost).toHaveBeenCalledWith(99, 1440, 4320);
    });
});
