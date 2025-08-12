/**
 * Structured logging utility for the MCP Musical Server with MCP protocol safety
 */

export interface LogContext {
  [key: string]: any;
}

export interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
}

class McpSafeLogger implements Logger {
  private readonly isMcpMode: boolean;
  private readonly logFile: string;

  constructor() {
    this.isMcpMode = process.env['NODE_ENV'] === 'production' || process.env['MCP_MODE'] === 'true';
    this.logFile = process.env['MCP_LOG_FILE'] || '/tmp/maestro-mcp.log';
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private writeToFile(message: string): void {
    try {
      const fs = require('fs');
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      // Silent fail to avoid breaking MCP protocol
    }
  }

  private logSafely(level: string, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message, context);
    
    if (this.isMcpMode) {
      // In MCP mode, write to file only to preserve stdout for JSON protocol
      this.writeToFile(formattedMessage);
    } else {
      // In non-MCP mode, use stderr to avoid stdout pollution
      process.stderr.write(formattedMessage + '\n');
    }
  }

  debug(message: string, context?: LogContext): void {
    this.logSafely('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.logSafely('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.logSafely('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.logSafely('error', message, context);
  }
}

// Export singleton logger instance that respects MCP protocol
export const logger: Logger = new McpSafeLogger();