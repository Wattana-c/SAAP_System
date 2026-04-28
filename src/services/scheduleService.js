const scheduleModel = require('../models/scheduleModel');

class ScheduleService {
    async getAllSchedules() {
        return await scheduleModel.findAll();
    }

    async schedulePost(postId, customMinDelay = null, customMaxDelay = null) {
        // Read config or use defaults
        const minMinutes = customMinDelay !== null ? customMinDelay : (parseInt(process.env.MIN_DELAY_MINUTES) || 15);
        const maxMinutes = customMaxDelay !== null ? customMaxDelay : (parseInt(process.env.MAX_DELAY_MINUTES) || 120);

        // Calculate random delay
        const randomDelayMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;

        const scheduledTime = new Date();
        scheduledTime.setMinutes(scheduledTime.getMinutes() + randomDelayMinutes);

        console.log(`[ScheduleService] Scheduling post ${postId} in ${randomDelayMinutes} minutes (at ${scheduledTime.toISOString()})`);

        const scheduleData = {
            post_id: postId,
            scheduled_time: scheduledTime,
            status: 'scheduled'
        };

        const newSchedule = await scheduleModel.create(scheduleData);
        return newSchedule;
    }
}

module.exports = new ScheduleService();
