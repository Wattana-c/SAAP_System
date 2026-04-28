const OpenAI = require('openai');

class CaptionService {
    constructor() {
        // Safe initialization if API key is missing (for local dev/sandbox)
        try {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY || 'dummy_key'
            });
        } catch (error) {
            console.error('Failed to initialize OpenAI:', error);
            this.openai = null;
        }
    }

    /**
     * Generates a highly persuasive Thai selling caption.
     * Uses OpenAI LLM. Falls back to template if API fails or key is missing.
     *
     * @param {string} title
     * @param {number} minPrice
     * @param {number} maxPrice
     * @param {string} link The redirect tracking link
     * @returns {Promise<string>} The generated Thai caption
     */
    async generateCaption(title, minPrice, maxPrice, link) {
        // Format price string gracefully
        let priceStr = `${minPrice}`;
        if (minPrice !== maxPrice) {
            priceStr = `${minPrice} - ${maxPrice}`;
        }

        // Only try LLM if a real key is present
        if (this.openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key') {
            try {
                const prompt = `Write a highly persuasive Thai social media post for an affiliate product.
Title: "${title}"
Price: ${priceStr} THB
Link: ${link}

Requirements:
- Identify the product category and explicitly address the target customer's pain point.
- Give a specific, relatable use case.
- Use emotional triggers (e.g. FOMO, excitement).
- Include appropriate emojis.
- End with a strong Call-To-Action pointing to the Link.
- Keep it concise, engaging, and in a friendly UGC (User Generated Content) tone.
- Do not use hashtags.`;

                const completion = await this.openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "gpt-3.5-turbo",
                    max_tokens: 250,
                    temperature: 0.7,
                });

                if (completion.choices && completion.choices.length > 0) {
                    return completion.choices[0].message.content.trim();
                }
            } catch (error) {
                console.error('[CaptionService] OpenAI generation failed, using fallback.', error.message);
            }
        }

        // Fallback Template (Rule-based UGC logic)
        return this.generateFallbackCaption(title, priceStr, link);
    }

    /**
     * Generates a template-based fallback caption.
     */
    generateFallbackCaption(title, priceStr, link) {

        // Randomize Hooks to keep it fresh and sound like UGC (User Generated Content)
        const hooks = [
            "😱 รีวิวแน่นจนต้องกดมาลอง! ใครยังไม่มีถือว่าพลาดมากก!",
            "✨ โดนป้ายยามาอีกที... สรุปคือดีจนต้องบอกต่อ!",
            "😭 รู้งี้ซื้อนานแล้ว! ไอเทมลับที่ทำให้ชีวิตง่ายขึ้น 300%",
            "🔥 ของมันต้องมีจริงๆ ยอดขายทะลุเป้า รีวิวแตกรัง!"
        ];

        // Randomize Urgencies
        const urgencies = [
            "🚨 แอบกระซิบว่า... ของลดเยอะมากและจะหมดแล้วนะคะ!",
            "⏰ โปรดีๆ แบบนี้ไม่ได้มีบ่อยๆ ลังเลคืออดนะพูดเลย!",
            "🏃‍♀️ พุ่งตัวไปกดด่วนๆ ก่อนของจะเกลี้ยงสต็อก!",
            "⚠️ เตือนแล้วนะ! หมดรอบนี้รอของเข้าอีกนานเลยจ้า!"
        ];

        const hook = hooks[Math.floor(Math.random() * hooks.length)];
        const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];

        // Detect category based on title keywords for personalization
        let painPoint = "เคยไหม? ซื้อของมาแล้วไม่ตรงปก ใช้ไม่ทน เสียความรู้สึกสุดๆ 😭";
        let benefit1 = "✅ ของแท้ 💯 ใช้งานดีจริง ตรงปกไม่จกตา";
        let benefit2 = "✅ ตอนนี้กำลังฮิตสุดๆ ไม่มีไม่ได้แล้ว!";

        const titleLower = title.toLowerCase();
        if (titleLower.includes('หูฟัง') || titleLower.includes('earphone') || titleLower.includes('headphone')) {
            painPoint = "ใครมีปัญหาหูฟังเสียงเบา ไมค์ช็อต แบตหมดไว... ฟังทางนี้เลย! 🎧";
            benefit1 = "✅ เสียงเบสแน่นตึ้บ ฟังเพลงฟิน เล่นเกมแยกเสียงชัดเจน!";
            benefit2 = "✅ ใส่สบาย ไม่เจ็บหู แถมแบตอึดใช้ได้ยาวๆ";
        } else if (titleLower.includes('รองเท้า') || titleLower.includes('shoe') || titleLower.includes('sneaker')) {
            painPoint = "ปัญหารองเท้ากัด เดินแล้วปวดเท้า... จบลงที่คู่นี้เลยค่ะ 👟";
            benefit1 = "✅ ทรงสวยเป๊ะ แมทช์ได้ทุกลุค ใส่ทำงานก็ดี เที่ยวก็ได้";
            benefit2 = "✅ พื้นนุ่มมมมม ซัพพอร์ตเท้าดีเว่อร์ เดินทั้งวันก็ไม่เมื่อย!";
        } else if (titleLower.includes('กระเป๋า') || titleLower.includes('bag')) {
            painPoint = "กระเป๋าใบเก่าจุของไม่พอ หาของก็ยาก... ต้องจัดใบนี้แล้วป่ะ? 👜";
            benefit1 = "✅ ช่องเก็บของเยอะมากก จัดระเบียบง่าย หาของเจอใน 1 วิ";
            benefit2 = "✅ ดีไซน์ลูกคุณ วัสดุพรีเมียม ถือแล้วดูแพงสุดๆ";
        }

        // Construct the structured caption (UGC Style)
        const caption = `
${hook}

${painPoint}
เพื่อนๆ คะ... ขออนุญาตมาป้ายยา 📦 **${title}** ตัวนี้คือตอบโจทย์มากกกก!
${benefit1}
${benefit2}

💸 ค่าตัวน้องเบาๆ แค่ **${priceStr} บาท**
(ราคาดีจนงงว่าร้านได้กำไรจากไหน 🥹)

${urgency}
🛒 พิกัดจิ้มตรงนี้เลยยยย 👇👇
${link}
`;

        return caption.trim();
    }
}

module.exports = new CaptionService();
