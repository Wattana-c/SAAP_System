const OpenAI = require('openai');
const clickModel = require('../models/clickModel');
const systemConfigModel = require('../models/systemConfigModel');

class CaptionOptimizerService {
    constructor() {
        try {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY || 'dummy_key'
            });
        } catch (error) {
            console.error('Failed to initialize OpenAI for Optimization:', error);
            this.openai = null;
        }
    }

    /**
     * Analyzes top performing posts and extracts winning patterns.
     */
    async updateGuidelines() {
        if (!this.openai || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
            console.log('[CaptionOptimizer] Skipping optimization, no valid OpenAI key.');
            return;
        }

        try {
            console.log('[CaptionOptimizer] Fetching top posts for analysis...');
            const topPosts = await clickModel.getTopPosts(10);

            if (topPosts.length === 0) {
                console.log('[CaptionOptimizer] No click data available yet.');
                return;
            }

            const postsDataStr = topPosts.map((p, i) => `Rank ${i+1} (Clicks: ${p.clicks}):\nCaption: ${p.caption}`).join('\n\n');

            const prompt = `Analyze these top-performing affiliate marketing posts.
Extract the winning patterns focusing specifically on:
1. The type of "Hook" that grabs attention.
2. The specific "Keywords" used.
3. The specific "Emojis" usage.
4. The general tone of voice.

Return a concise summary of guidelines (max 200 words) that I can inject into future prompts to replicate this success. Do not include introductory text, just the bulleted guidelines.

Top Posts Data:
${postsDataStr}`;

            const completion = await this.openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4-turbo", // Could use gpt-3.5 for cost, but GPT-4 is better for analysis
                max_tokens: 300,
                temperature: 0.5,
            });

            if (completion.choices && completion.choices.length > 0) {
                const guidelines = completion.choices[0].message.content.trim();
                await systemConfigModel.setConfig('AI_CAPTION_GUIDELINES', guidelines);
                console.log('[CaptionOptimizer] Guidelines successfully updated.');
            }
        } catch (error) {
            console.error('[CaptionOptimizer] Failed to run optimization cycle:', error.message);
        }
    }
}

module.exports = new CaptionOptimizerService();
