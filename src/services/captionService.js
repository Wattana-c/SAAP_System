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

        // Construct the structured caption (UGC Style)
        const caption = `
${hook}

เพื่อนๆ คะ... ขออนุญาตมาป้ายยา 📦 **${title}** ตัวนี้คือตอบโจทย์มากกกก!
✅ ของแท้ 💯 ใช้งานดีจริง ตรงปกไม่จกตา
✅ ตอนนี้กำลังฮิตสุดๆ ไม่มีไม่ได้แล้ว!

💸 ค่าตัวน้องเบาๆ แค่ **${priceStr} บาท**
(ราคาดีจนงงว่าร้านได้กำไรจากไหน 🥹)

${urgency}
🛒 พิกัดจิ้มตรงนี้เลยยยย 👇👇
`;

        return caption.trim();
    }
}

module.exports = new CaptionService();
