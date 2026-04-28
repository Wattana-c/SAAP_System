const captionOptimizerService = require('../services/captionOptimizerService');
const productScoringService = require('../services/productScoringService');
const trafficService = require('../services/trafficService');

class OptimizationWorker {
    constructor() {
        this.intervalId = null;
        // Run once every 24 hours (86400000 ms)
        this.intervalMs = 24 * 60 * 60 * 1000;
    }

    start() {
        console.log(`[OptimizationWorker] Starting background optimizer worker...`);
        // Schedule interval
        this.intervalId = setInterval(() => this.runOptimizations(), this.intervalMs);

        // Initial run offset slightly to not block startup
        setTimeout(() => this.runOptimizations(), 5000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log(`[OptimizationWorker] Stopped background optimizer worker.`);
        }
    }

    async runOptimizations() {
        try {
            console.log(`[OptimizationWorker] Running optimization cycles...`);

            // 1. Optimize Captions (Learn from A/B variants and CTR)
            await captionOptimizerService.updateGuidelines();

            // 2. Score Products (Identify profitable items)
            await productScoringService.updateAllScores();

            // 3. Distribution & Traffic Strategy (Repost top 10% winners to rotated pages)
            await trafficService.processTopProductLoop();

            console.log(`[OptimizationWorker] Optimization cycles completed.`);
        } catch (error) {
            console.error(`[OptimizationWorker] Error during optimization: ${error.message}`);
        }
    }
}

module.exports = new OptimizationWorker();
