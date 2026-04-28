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

    async create(scheduleData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('post_id', scheduleData.post_id)
                .input('scheduled_time', scheduleData.scheduled_time)
                .input('status', scheduleData.status || 'scheduled')
                .query(`
                    INSERT INTO schedules (post_id, scheduled_time, status)
                    OUTPUT INSERTED.*
                    VALUES (@post_id, @scheduled_time, @status)
                `);
            return result.recordset[0];
        } catch (error) {
            throw new AppError(`Database Error creating schedule: ${error.message}`, 500);
        }
    }

    async getAndLockPendingSchedules() {
        try {
            // Using an atomic UPDATE with OUTPUT allows us to fetch records and mark them as processing
            // concurrently without risk of race conditions or duplicate posting by other potential worker nodes.
            const pool = await poolPromise;
            const result = await pool.request().query(`
                UPDATE schedules
                SET status = 'processing'
                OUTPUT
                    INSERTED.id,
                    INSERTED.post_id,
                    INSERTED.scheduled_time,
                    INSERTED.status
                WHERE status = 'scheduled'
                  AND scheduled_time <= GETDATE()
            `);
            return result.recordset;
        } catch (error) {
            throw new AppError(`Database Error locking schedules: ${error.message}`, 500);
        }
    }

    async updateStatus(id, status) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', id)
                .input('status', status)
                .query(`
                    UPDATE schedules
                    SET status = @status
                    OUTPUT INSERTED.*
                    WHERE id = @id
                `);
            return result.recordset[0];
        } catch (error) {
            throw new AppError(`Database Error updating schedule status: ${error.message}`, 500);
        }
    }
}

module.exports = new ScheduleModel();
