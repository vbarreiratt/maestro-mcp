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
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map