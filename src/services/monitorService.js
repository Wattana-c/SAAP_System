const appConfig = require('../configs/appConfig');
const logger = require('./loggerService');

class MonitorService {
    constructor() {
        this.errorCount = 0;
        this.resetInterval = setInterval(() => {
            this.errorCount = 0; // Reset error count every hour
        }, 60 * 60 * 1000);
    }

    reportError() {
        this.errorCount++;
        const threshold = appConfig.get('SAFE_MODE_ERROR_THRESHOLD');

        if (this.errorCount >= threshold && appConfig.get('ENABLE_AUTOMATION')) {
            logger.error('MonitorService', `Error threshold (${threshold}) reached. Triggering SAFE MODE (pausing automation).`);
            appConfig.set('ENABLE_AUTOMATION', false);
            this.errorCount = 0; // Reset after tripping
        }
    }

    getStatus() {
        return {
            safeModeActive: !appConfig.get('ENABLE_AUTOMATION'),
            recentErrors: this.errorCount,
            threshold: appConfig.get('SAFE_MODE_ERROR_THRESHOLD')
        };
    }
}

module.exports = new MonitorService();
