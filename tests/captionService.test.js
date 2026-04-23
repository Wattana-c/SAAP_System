const captionService = require('../src/services/captionService');

describe('CaptionService', () => {
    it('should generate a caption with single price', () => {
        const caption = captionService.generateCaption('Test Product', 100.5, 100.5);
        expect(caption).toContain('Test Product');
        expect(caption).toContain('100.5 บาท');
        expect(caption).toContain('🛒 พิกัดจิ้มตรงนี้เลยยยย 👇👇');
    });

    it('should generate a caption with a price range', () => {
        const caption = captionService.generateCaption('Range Product', 100, 200);
        expect(caption).toContain('Range Product');
        expect(caption).toContain('100 - 200 บาท');
        expect(caption).toContain('🛒 พิกัดจิ้มตรงนี้เลยยยย 👇👇');
    });
});
