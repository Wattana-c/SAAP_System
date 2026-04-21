const scheduleService = require('../services/scheduleService');

class ScheduleController {
    async getSchedules(req, res, next) {
        try {
            const schedules = await scheduleService.getAllSchedules();
            res.status(200).json({
                success: true,
                data: schedules
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ScheduleController();
