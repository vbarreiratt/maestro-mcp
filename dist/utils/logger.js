/**
 * Structured logging utility for the MCP Musical Server with MCP protocol safety
 */
class McpSafeLogger {
    isMcpMode;
    logFile;
    constructor() {
        this.isMcpMode = process.env['NODE_ENV'] === 'production' || process.env['MCP_MODE'] === 'true';
        this.logFile = process.env['MCP_LOG_FILE'] || '/tmp/maestro-mcp.log';
    }
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
    }
    writeToFile(message) {
        try {
            const fs = require('fs');
            fs.appendFileSync(this.logFile, message + '\n');
        }
        catch (error) {
            // Silent fail to avoid breaking MCP protocol
        }
    }
    logSafely(level, message, context) {
        const formattedMessage = this.formatMessage(level, message, context);
        if (this.isMcpMode) {
            // In MCP mode, write to file only to preserve stdout for JSON protocol
            this.writeToFile(formattedMessage);
        }
        else {
            // In non-MCP mode, use stderr to avoid stdout pollution
            process.stderr.write(formattedMessage + '\n');
        }
    }
    debug(message, context) {
        this.logSafely('debug', message, context);
    }
    info(message, context) {
        this.logSafely('info', message, context);
    }
    warn(message, context) {
        this.logSafely('warn', message, context);
    }
    error(message, context) {
        this.logSafely('error', message, context);
    }
}
// Export singleton logger instance that respects MCP protocol
export const logger = new McpSafeLogger();
//# sourceMappingURL=logger.js.map