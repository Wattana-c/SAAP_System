class LoggerService {
    constructor() {
        this.logs = [];
        this.maxLogs = 100; // Keep last 100 logs in memory for the admin dashboard
    }

    log(level, component, message) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            component,
            message
        };

        this.logs.unshift(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }

        // Also output to console
        if (level === 'error') {
            console.error(`[${component}] ${message}`);
        } else {
            console.log(`[${component}] ${message}`);
        }
    }

    info(component, message) {
        this.log('info', component, message);
    }

    error(component, message) {
        this.log('error', component, message);
    }

    getRecentLogs() {
        return this.logs;
    }
}

module.exports = new LoggerService();
