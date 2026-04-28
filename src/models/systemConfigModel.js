const { poolPromise, sql } = require('../configs/db');
const AppError = require('../utils/AppError');

class SystemConfigModel {
    async getConfig(key) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('key', sql.NVarChar(100), key)
                .query('SELECT config_value FROM system_configs WHERE config_key = @key');
            return result.recordset.length > 0 ? result.recordset[0].config_value : null;
        } catch (error) {
            throw new AppError(`Database Error fetching config: ${error.message}`, 500);
        }
    }

    async setConfig(key, value) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('key', sql.NVarChar(100), key)
                .input('value', sql.NVarChar(sql.MAX), value)
                .query(`
                    IF EXISTS (SELECT 1 FROM system_configs WHERE config_key = @key)
                    BEGIN
                        UPDATE system_configs SET config_value = @value, updated_at = GETDATE() WHERE config_key = @key
                    END
                    ELSE
                    BEGIN
                        INSERT INTO system_configs (config_key, config_value) VALUES (@key, @value)
                    END
                `);
            return true;
        } catch (error) {
            throw new AppError(`Database Error setting config: ${error.message}`, 500);
        }
    }
}

module.exports = new SystemConfigModel();
