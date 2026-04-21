const { poolPromise } = require('../configs/db');

class ScheduleModel {
    async findAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT * FROM schedules');
            return result.recordset;
        } catch (error) {
            throw new Error(`Error fetching schedules: ${error.message}`);
        }
    }
}

module.exports = new ScheduleModel();
