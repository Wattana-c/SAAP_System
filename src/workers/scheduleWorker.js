const scheduleModel = require('../models/scheduleModel');
const postService = require('../services/postService');

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

        this.isRunning = true;
        try {
            console.log(`[ScheduleWorker] Checking for pending schedules...`);

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
                    console.log(`[ScheduleWorker] Publishing post ID: ${schedule.post_id}`);
                    await postService.publishPost(schedule.post_id);

                    // Mark as completed
                    await scheduleModel.updateStatus(schedule.id, 'completed');
                    console.log(`[ScheduleWorker] Successfully published and updated schedule ID: ${schedule.id}`);
                } catch (error) {
                    console.error(`[ScheduleWorker] Failed to publish post ID ${schedule.post_id}. Error: ${error.message}`);
                    // Mark schedule as failed
                    await scheduleModel.updateStatus(schedule.id, 'failed');
                }
            }

        } catch (error) {
            console.error(`[ScheduleWorker] Critical Error during processing: ${error.message}`);
        } finally {
            this.isRunning = false;
        }
    }
}

module.exports = new ScheduleWorker();
