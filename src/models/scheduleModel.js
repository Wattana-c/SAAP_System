const { poolPromise } = require('../configs/db');
const AppError = require('../utils/AppError');

class ScheduleModel {
    async findAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT * FROM schedules');
            return result.recordset;
        } catch (error) {
            throw new AppError(`Database Error: ${error.message}`, 500);
        }
    }
}

module.exports = new ScheduleModel();
