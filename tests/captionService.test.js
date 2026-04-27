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

    it('should generate personalized content for หูฟัง (earphones)', () => {
        const caption = captionService.generateCaption('หูฟังไร้สาย Bluetooth 5.0', 299, 299);
        expect(caption).toContain('ใครมีปัญหาหูฟังเสียงเบา ไมค์ช็อต แบตหมดไว... ฟังทางนี้เลย! 🎧');
        expect(caption).toContain('✅ เสียงเบสแน่นตึ้บ ฟังเพลงฟิน เล่นเกมแยกเสียงชัดเจน!');
    });

    it('should generate personalized content for รองเท้า (shoes)', () => {
        const caption = captionService.generateCaption('รองเท้าผ้าใบผู้หญิง แฟชั่นเกาหลี', 199, 199);
        expect(caption).toContain('ปัญหารองเท้ากัด เดินแล้วปวดเท้า... จบลงที่คู่นี้เลยค่ะ 👟');
        expect(caption).toContain('✅ พื้นนุ่มมมมม ซัพพอร์ตเท้าดีเว่อร์ เดินทั้งวันก็ไม่เมื่อย!');
    });

    it('should generate personalized content for กระเป๋า (bags)', () => {
        const caption = captionService.generateCaption('กระเป๋าสะพายข้างแฟชั่นมินิมอล', 350, 350);
        expect(caption).toContain('กระเป๋าใบเก่าจุของไม่พอ หาของก็ยาก... ต้องจัดใบนี้แล้วป่ะ? 👜');
        expect(caption).toContain('✅ ช่องเก็บของเยอะมากก จัดระเบียบง่าย หาของเจอใน 1 วิ');
    });

    it('should generate generic fallback content for unmatched categories', () => {
        const caption = captionService.generateCaption('ครีมกันแดดทาหน้า', 99, 99);
        expect(caption).toContain('เคยไหม? ซื้อของมาแล้วไม่ตรงปก ใช้ไม่ทน เสียความรู้สึกสุดๆ 😭');
        expect(caption).toContain('✅ ของแท้ 💯 ใช้งานดีจริง ตรงปกไม่จกตา');
    });
});
