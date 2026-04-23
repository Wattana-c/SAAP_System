class CaptionService {
    /**
     * Generates a highly persuasive Thai selling caption.
     * In a production environment, this could integrate with an LLM like OpenAI.
     * For now, it uses dynamic templates based on the product details.
     *
     * @param {string} title
     * @param {number} minPrice
     * @param {number} maxPrice
     * @returns {string} The generated Thai caption
     */
    generateCaption(title, minPrice, maxPrice) {
        // Format price string gracefully
        let priceStr = `${minPrice}`;
        if (minPrice !== maxPrice) {
            priceStr = `${minPrice} - ${maxPrice}`;
        }

        // Randomize Hooks to keep it fresh
        const hooks = [
            "🔥 หยุดก่อน! พลาดชิ้นนี้ไปเสียใจแน่นอน!",
            "🚨 ด่วน! ของดีที่ทุกคนตามหามาแล้ว!",
            "😱 กรี๊ดดด! ไม่คิดว่าจะคุ้มขนาดนี้!",
            "✨ ไอเทมเด็ดที่ชาวทวิต(X) รีวิวกันสนั่น!"
        ];

        // Randomize Urgencies
        const urgencies = [
            "⚠️ รีบเลย ของหมดไวมากกกก!",
            "⏰ ลดราคาวันนี้วันสุดท้ายแล้วนะ!",
            "🏃‍♀️ พุ่งตัวไปกดให้ไว ก่อนของจะเกลี้ยง!",
            "💥 สินค้ามีจำนวนจำกัด ช้าหมดอดนะจ๊ะ!"
        ];

        const hook = hooks[Math.floor(Math.random() * hooks.length)];
        const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];

        // Construct the structured caption
        const caption = `
${hook}

📦 **${title}**
✨ จุดเด่นที่ต้องมี:
✔️ คุณภาพคุ้มเกินราคา ใช้แล้วต้องบอกต่อ
✔️ ดีไซน์ปัง ตอบโจทย์ทุกการใช้งาน
✔️ รีวิวแน่น ของแท้แน่นอน 💯

💸 ราคาโดนใจสุดๆ เพียง **${priceStr} บาท** เท่านั้น!

${urgency}
👇 กดสั่งซื้อได้เลยที่ลิ้งค์ด้านล่าง 👇
`;

        return caption.trim();
    }
}

module.exports = new CaptionService();
