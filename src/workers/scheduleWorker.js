const scheduleModel = require('../models/scheduleModel');
const postService = require('../services/postService');
const appConfig = require('../configs/appConfig');
const logger = require('../services/loggerService');

class ScheduleWorker {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
        // Run every 5 minutes
        this.intervalMs = 5 * 60 * 1000;
    }

    start() {
        console.log(`[ScheduleWorker] Starting background worker...`);
        // Run immediately on start, then set interval
        this.processSchedules();
        this.intervalId = setInterval(() => this.processSchedules(), this.intervalMs);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log(`[ScheduleWorker] Stopped background worker.`);
        }
    }

    async processSchedules() {
        if (this.isRunning) {
            return;
        }

        if (!appConfig.get('ENABLE_AUTOMATION')) {
            return;
        }

        this.isRunning = true;
        try {
            logger.info('ScheduleWorker', `Checking for pending schedules...`);

            // Atomically fetch and lock schedules to prevent double posting
            const pendingSchedules = await scheduleModel.getAndLockPendingSchedules();

            if (pendingSchedules.length === 0) {
                console.log(`[ScheduleWorker] No pending schedules found.`);
                this.isRunning = false;
                return;
            }

            console.log(`[ScheduleWorker] Found ${pendingSchedules.length} schedules to process.`);

            for (const schedule of pendingSchedules) {
                try {
                    logger.info('ScheduleWorker', `Publishing post ID: ${schedule.post_id}`);
                    await postService.publishPost(schedule.post_id);

                    // Mark as completed
                    await scheduleModel.updateStatus(schedule.id, 'completed');
                    logger.info('ScheduleWorker', `Successfully published and updated schedule ID: ${schedule.id}`);
                } catch (error) {
                    logger.error('ScheduleWorker', `Failed to publish post ID ${schedule.post_id}. Error: ${error.message}`);
                    // Report to monitor for safe mode tracking
                    const monitorService = require('../services/monitorService');
                    monitorService.reportError();
                    // Mark schedule as failed
                    await scheduleModel.updateStatus(schedule.id, 'failed');
                }
            }

        } catch (error) {
            logger.error('ScheduleWorker', `Critical Error during processing: ${error.message}`);
        } finally {
            this.isRunning = false;
        }
    }
}

module.exports = new ScheduleWorker();
