/**
 * Common Zod schemas for MCP server operations
 * Shared validation schemas across all modules
 */
import { z } from 'zod';
// Base response schemas
export const SuccessResponseSchema = z.object({
    success: z.literal(true),
    data: z.any().optional(),
    message: z.string().optional(),
    timestamp: z.date().optional()
});
export const ErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional()
    }),
    timestamp: z.date().optional()
});
// Generic response union
export const ResponseSchema = z.union([SuccessResponseSchema, ErrorResponseSchema]);
// Performance metrics schema
export const PerformanceMetricsSchema = z.object({
    latency: z.number().min(0).describe('Latency in milliseconds'),
    throughput: z.number().min(0).describe('Events per second'),
    memoryUsage: z.number().min(0).describe('Memory usage in MB'),
    cpuUsage: z.number().min(0).max(100).describe('CPU usage percentage'),
    timestamp: z.date()
});
// Logging schema
export const LogEntrySchema = z.object({
    level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
    message: z.string().min(1),
    timestamp: z.date(),
    component: z.string().optional(),
    data: z.any().optional(),
    error: z.object({
        name: z.string(),
        message: z.string(),
        stack: z.string().optional()
    }).optional()
});
// Configuration schemas
export const MidiConfigSchema = z.object({
    defaultOutputPort: z.string().optional(),
    bufferSize: z.number().int().min(32).max(2048).default(128),
    sampleRate: z.number().int().min(22050).max(192000).default(44100),
    latencyTarget: z.number().min(1).max(100).default(15), // ms
    enableLogging: z.boolean().default(true),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});
export const ServerConfigSchema = z.object({
    name: z.string().default('maestro-mcp'),
    version: z.string().default('1.0.0'),
    port: z.number().int().min(1000).max(65535).optional(),
    enableInspector: z.boolean().default(true),
    maxConcurrentConnections: z.number().int().min(1).max(100).default(10),
    midi: MidiConfigSchema
});
// Tool result schemas for MCP
export const ToolResultSchema = z.object({
    content: z.array(z.object({
        type: z.literal('text'),
        text: z.string()
    })),
    isError: z.boolean().optional()
});
// Health check schema
export const HealthCheckSchema = z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    timestamp: z.date(),
    checks: z.object({
        midi: z.object({
            portsAvailable: z.boolean(),
            defaultPortConnected: z.boolean(),
            latency: z.number().optional()
        }),
        memory: z.object({
            usage: z.number(),
            limit: z.number(),
            healthy: z.boolean()
        }),
        performance: z.object({
            averageLatency: z.number(),
            targetLatency: z.number(),
            healthy: z.boolean()
        })
    })
});
// Rate limiting schema
export const RateLimitSchema = z.object({
    maxRequests: z.number().int().min(1).default(100),
    windowMs: z.number().int().min(1000).default(60000), // 1 minute
    enabled: z.boolean().default(true)
});
// Cache configuration
export const CacheConfigSchema = z.object({
    enabled: z.boolean().default(true),
    maxEntries: z.number().int().min(10).max(10000).default(1000),
    ttlSeconds: z.number().int().min(1).max(3600).default(300) // 5 minutes
});
// Validation helpers
export function createErrorResponse(code, message, details) {
    return ErrorResponseSchema.parse({
        success: false,
        error: { code, message, details },
        timestamp: new Date()
    });
}
export function createSuccessResponse(data, message) {
    return SuccessResponseSchema.parse({
        success: true,
        data,
        message,
        timestamp: new Date()
    });
}
export function createToolResult(text, isError = false) {
    return ToolResultSchema.parse({
        content: [{ type: 'text', text }],
        isError
    });
}
// Common error codes
export const ErrorCodes = {
    // MIDI errors
    MIDI_PORT_NOT_FOUND: 'MIDI_PORT_NOT_FOUND',
    MIDI_CONNECTION_FAILED: 'MIDI_CONNECTION_FAILED',
    MIDI_SEND_FAILED: 'MIDI_SEND_FAILED',
    MIDI_INVALID_NOTE: 'MIDI_INVALID_NOTE',
    MIDI_INVALID_CONTROLLER: 'MIDI_INVALID_CONTROLLER',
    // Musical errors
    MUSIC_INVALID_CHORD: 'MUSIC_INVALID_CHORD',
    MUSIC_INVALID_SCALE: 'MUSIC_INVALID_SCALE',
    MUSIC_INVALID_TIME_SIGNATURE: 'MUSIC_INVALID_TIME_SIGNATURE',
    MUSIC_INVALID_TEMPO: 'MUSIC_INVALID_TEMPO',
    // System errors
    SYSTEM_INITIALIZATION_FAILED: 'SYSTEM_INITIALIZATION_FAILED',
    SYSTEM_RESOURCE_EXHAUSTED: 'SYSTEM_RESOURCE_EXHAUSTED',
    SYSTEM_TIMEOUT: 'SYSTEM_TIMEOUT',
    // Validation errors
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    SCHEMA_VALIDATION_FAILED: 'SCHEMA_VALIDATION_FAILED',
    // Tool errors
    TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',
    TOOL_INVALID_PARAMETERS: 'TOOL_INVALID_PARAMETERS',
    TOOL_NOT_FOUND: 'TOOL_NOT_FOUND'
};
// Common success messages
export const SuccessMessages = {
    MIDI_PORT_CONNECTED: 'MIDI port connected successfully',
    MIDI_NOTE_SENT: 'MIDI note sent successfully',
    MIDI_SEQUENCE_EXECUTED: 'MIDI sequence executed successfully',
    MIDI_TRANSPORT_CONTROLLED: 'MIDI transport controlled successfully',
    CONFIGURATION_UPDATED: 'Configuration updated successfully',
    SYSTEM_INITIALIZED: 'System initialized successfully'
};
//# sourceMappingURL=common-schemas.js.map