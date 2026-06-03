const appConfig = require('../configs/appConfig');
const monitorService = require('../services/monitorService');
const loggerService = require('../services/loggerService');

class AdminController {
    getStatus(req, res) {
        res.status(200).json({
            success: true,
            data: {
                automationEnabled: appConfig.get('ENABLE_AUTOMATION'),
                monitorStatus: monitorService.getStatus()
            }
        });
    }

    toggleAutomation(req, res) {
        const { enable } = req.body;
        if (typeof enable !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Invalid parameter: enable must be boolean' });
        }

        appConfig.set('ENABLE_AUTOMATION', enable);
        const msg = enable ? 'Automation Enabled' : 'Automation Disabled';
        loggerService.info('AdminController', msg);

        res.status(200).json({
            success: true,
            message: msg,
            data: { automationEnabled: appConfig.get('ENABLE_AUTOMATION') }
        });
    }

    updateConfig(req, res) {
        const updates = req.body;
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ success: false, message: 'Invalid body' });
        }

        for (const [key, value] of Object.entries(updates)) {
            appConfig.set(key, value);
        }

        loggerService.info('AdminController', 'System Configuration Updated');

        res.status(200).json({
            success: true,
            message: 'Configuration updated successfully',
            data: appConfig.getAll()
        });
    }

    getLogs(req, res) {
        res.status(200).json({
            success: true,
            data: loggerService.getRecentLogs()
        });
    }
}

module.exports = new AdminController();
