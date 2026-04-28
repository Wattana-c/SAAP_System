const captionService = require('../src/services/captionService');

describe('CaptionService - Fallback/Template Logic', () => {
    const mockLink = 'http://localhost:8080/r/123';

    it('should generate a fallback caption with single price', () => {
        const caption = captionService.generateFallbackCaption('Test Product', '100.5', mockLink);
        expect(caption).toContain('Test Product');
        expect(caption).toContain('100.5 บาท');
        expect(caption).toContain('🛒 พิกัดจิ้มตรงนี้เลยยยย 👇👇');
        expect(caption).toContain(mockLink);
    });

    it('should generate a fallback caption with a price range', () => {
        const caption = captionService.generateFallbackCaption('Range Product', '100 - 200', mockLink);
        expect(caption).toContain('Range Product');
        expect(caption).toContain('100 - 200 บาท');
        expect(caption).toContain('🛒 พิกัดจิ้มตรงนี้เลยยยย 👇👇');
        expect(caption).toContain(mockLink);
    });

    it('should generate personalized fallback content for หูฟัง (earphones)', () => {
        const caption = captionService.generateFallbackCaption('หูฟังไร้สาย Bluetooth 5.0', '299', mockLink);
        expect(caption).toContain('ใครมีปัญหาหูฟังเสียงเบา ไมค์ช็อต แบตหมดไว... ฟังทางนี้เลย! 🎧');
        expect(caption).toContain('✅ เสียงเบสแน่นตึ้บ ฟังเพลงฟิน เล่นเกมแยกเสียงชัดเจน!');
    });

    it('should generate personalized fallback content for รองเท้า (shoes)', () => {
        const caption = captionService.generateFallbackCaption('รองเท้าผ้าใบผู้หญิง แฟชั่นเกาหลี', '199', mockLink);
        expect(caption).toContain('ปัญหารองเท้ากัด เดินแล้วปวดเท้า... จบลงที่คู่นี้เลยค่ะ 👟');
        expect(caption).toContain('✅ พื้นนุ่มมมมม ซัพพอร์ตเท้าดีเว่อร์ เดินทั้งวันก็ไม่เมื่อย!');
    });

    it('should generate personalized fallback content for กระเป๋า (bags)', () => {
        const caption = captionService.generateFallbackCaption('กระเป๋าสะพายข้างแฟชั่นมินิมอล', '350', mockLink);
        expect(caption).toContain('กระเป๋าใบเก่าจุของไม่พอ หาของก็ยาก... ต้องจัดใบนี้แล้วป่ะ? 👜');
        expect(caption).toContain('✅ ช่องเก็บของเยอะมากก จัดระเบียบง่าย หาของเจอใน 1 วิ');
    });

    it('should generate generic fallback content for unmatched categories', () => {
        const caption = captionService.generateFallbackCaption('ครีมกันแดดทาหน้า', '99', mockLink);
        expect(caption).toContain('เคยไหม? ซื้อของมาแล้วไม่ตรงปก ใช้ไม่ทน เสียความรู้สึกสุดๆ 😭');
        expect(caption).toContain('✅ ของแท้ 💯 ใช้งานดีจริง ตรงปกไม่จกตา');
    });
});

describe('CaptionService - OpenAI Logic', () => {
    const mockLink = 'http://localhost:8080/r/123';

    beforeEach(() => {
        // Reset openai instance mock logic if necessary
        jest.clearAllMocks();
    });

    it('should call generateFallbackCaption if OpenAI throws an error', async () => {
        // Force the openai instance to exist but fail
        captionService.openai = {
            chat: {
                completions: {
                    create: jest.fn().mockRejectedValue(new Error('OpenAI Error'))
                }
            }
        };
        process.env.OPENAI_API_KEY = 'real_test_key'; // Needed to bypass the dummy check

        const spy = jest.spyOn(captionService, 'generateFallbackCaption');

        const caption = await captionService.generateCaption('Test Fallback', 10, 20, mockLink);

        expect(spy).toHaveBeenCalledWith('Test Fallback', '10 - 20', mockLink);
        expect(caption).toContain('Test Fallback');
    });

    it('should return LLM generated caption on success', async () => {
        const mockGeneratedContent = 'LLM Generated Highly Persuasive Thai Caption!';

        captionService.openai = {
            chat: {
                completions: {
                    create: jest.fn().mockResolvedValue({
                        choices: [{ message: { content: mockGeneratedContent } }]
                    })
                }
            }
        };
        process.env.OPENAI_API_KEY = 'real_test_key';

        const caption = await captionService.generateCaption('Test AI', 10, 20, mockLink);

        expect(caption).toBe(mockGeneratedContent);
    });
});
