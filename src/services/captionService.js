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
     * Generates 3 highly persuasive Thai selling caption variations (A/B testing).
     * Uses OpenAI LLM in JSON mode. Falls back to template if API fails or key is missing.
     *
     * @param {string} title
     * @param {number} minPrice
     * @param {number} maxPrice
     * @param {string} link The redirect tracking link
     * @param {string} additionalGuidelines Optional optimized guidelines learned from past posts
     * @returns {Promise<{A: string, B: string, C: string}>} The generated Thai captions
     */
    async generateCaption(title, minPrice, maxPrice, additionalGuidelines = "") {
        // Format price string gracefully
        let priceStr = `${minPrice}`;
        if (minPrice !== maxPrice) {
            priceStr = `${minPrice} - ${maxPrice}`;
        }

        if (this.openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key') {
            try {
                const prompt = `Write 3 different highly persuasive Thai social media posts for an affiliate product.
Title: "${title}"
Price: ${priceStr} THB

Variations:
Version A: Emotional & FOMO (Fear Of Missing Out) - High urgency, excitement.
Version B: Logical & Benefit-driven - Focus on the pain point solved and quality.
Version C: Short & Direct - Quick, punchy, UGC (User Generated Content) style review.

Requirements for all:
- Make variations completely distinct from one another to avoid duplication detection by Facebook algorithms.
- Include appropriate emojis.
- End with a strong Call-To-Action pointing to the exact string "{{LINK}}". Do not invent a URL, just print "{{LINK}}".
- Do not use hashtags.
${additionalGuidelines ? '- EXTRA GUIDELINES FROM PAST PERFORMANCE:\n' + additionalGuidelines : ''}

Output strictly as JSON in the following format:
{
  "A": "caption A text...",
  "B": "caption B text...",
  "C": "caption C text..."
}`;

                const completion = await this.openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "gpt-3.5-turbo",
                    response_format: { type: "json_object" },
                    max_tokens: 800,
                    temperature: 0.8,
                });

                if (completion.choices && completion.choices.length > 0) {
                    const parsed = JSON.parse(completion.choices[0].message.content.trim());
                    if (parsed.A && parsed.B && parsed.C) {
                        return parsed;
                    }
                }
            } catch (error) {
                console.error('[CaptionService] OpenAI generation failed, using fallback.', error.message);
            }
        }

        // Fallback: Generate one and assign it to A, B, and C with slight manual variations
        const baseCaption = this.generateFallbackCaption(title, priceStr);
        return {
            A: `🔥 [แบบกระตุ้นด่วน]\n` + baseCaption,
            B: `💡 [แบบเน้นเหตุผล]\n` + baseCaption,
            C: `✨ [แบบรีวิวจริง]\n` + baseCaption
        };
    }

    /**
     * Generates a template-based fallback caption with {{LINK}} placeholder.
     */
    generateFallbackCaption(title, priceStr) {

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
{{LINK}}
`;

        return caption.trim();
    }
}

module.exports = new CaptionService();
