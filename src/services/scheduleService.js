const scheduleModel = require('../models/scheduleModel');

class ScheduleService {
    async getAllSchedules() {
        return await scheduleModel.findAll();
    }
}

module.exports = new ScheduleService();
