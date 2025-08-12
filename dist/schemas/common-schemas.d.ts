/**
 * Common Zod schemas for MCP server operations
 * Shared validation schemas across all modules
 */
import { z } from 'zod';
export declare const SuccessResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodOptional<z.ZodAny>;
    message: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    success: true;
    message?: string | undefined;
    data?: any;
    timestamp?: Date | undefined;
}, {
    success: true;
    message?: string | undefined;
    data?: any;
    timestamp?: Date | undefined;
}>;
export declare const ErrorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: any;
    }, {
        code: string;
        message: string;
        details?: any;
    }>;
    timestamp: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp?: Date | undefined;
}, {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp?: Date | undefined;
}>;
export declare const ResponseSchema: z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodOptional<z.ZodAny>;
    message: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    success: true;
    message?: string | undefined;
    data?: any;
    timestamp?: Date | undefined;
}, {
    success: true;
    message?: string | undefined;
    data?: any;
    timestamp?: Date | undefined;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: any;
    }, {
        code: string;
        message: string;
        details?: any;
    }>;
    timestamp: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp?: Date | undefined;
}, {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp?: Date | undefined;
}>]>;
export declare const PerformanceMetricsSchema: z.ZodObject<{
    latency: z.ZodNumber;
    throughput: z.ZodNumber;
    memoryUsage: z.ZodNumber;
    cpuUsage: z.ZodNumber;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    timestamp: Date;
    latency: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
}, {
    timestamp: Date;
    latency: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
}>;
export declare const LogEntrySchema: z.ZodObject<{
    level: z.ZodEnum<["debug", "info", "warn", "error", "fatal"]>;
    message: z.ZodString;
    timestamp: z.ZodDate;
    component: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        message: z.ZodString;
        stack: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        name: string;
        stack?: string | undefined;
    }, {
        message: string;
        name: string;
        stack?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    timestamp: Date;
    level: "error" | "debug" | "info" | "warn" | "fatal";
    data?: any;
    error?: {
        message: string;
        name: string;
        stack?: string | undefined;
    } | undefined;
    component?: string | undefined;
}, {
    message: string;
    timestamp: Date;
    level: "error" | "debug" | "info" | "warn" | "fatal";
    data?: any;
    error?: {
        message: string;
        name: string;
        stack?: string | undefined;
    } | undefined;
    component?: string | undefined;
}>;
export declare const MidiConfigSchema: z.ZodObject<{
    defaultOutputPort: z.ZodOptional<z.ZodString>;
    bufferSize: z.ZodDefault<z.ZodNumber>;
    sampleRate: z.ZodDefault<z.ZodNumber>;
    latencyTarget: z.ZodDefault<z.ZodNumber>;
    enableLogging: z.ZodDefault<z.ZodBoolean>;
    logLevel: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
}, "strip", z.ZodTypeAny, {
    bufferSize: number;
    sampleRate: number;
    latencyTarget: number;
    enableLogging: boolean;
    logLevel: "error" | "debug" | "info" | "warn";
    defaultOutputPort?: string | undefined;
}, {
    defaultOutputPort?: string | undefined;
    bufferSize?: number | undefined;
    sampleRate?: number | undefined;
    latencyTarget?: number | undefined;
    enableLogging?: boolean | undefined;
    logLevel?: "error" | "debug" | "info" | "warn" | undefined;
}>;
export declare const ServerConfigSchema: z.ZodObject<{
    name: z.ZodDefault<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    port: z.ZodOptional<z.ZodNumber>;
    enableInspector: z.ZodDefault<z.ZodBoolean>;
    maxConcurrentConnections: z.ZodDefault<z.ZodNumber>;
    midi: z.ZodObject<{
        defaultOutputPort: z.ZodOptional<z.ZodString>;
        bufferSize: z.ZodDefault<z.ZodNumber>;
        sampleRate: z.ZodDefault<z.ZodNumber>;
        latencyTarget: z.ZodDefault<z.ZodNumber>;
        enableLogging: z.ZodDefault<z.ZodBoolean>;
        logLevel: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    }, "strip", z.ZodTypeAny, {
        bufferSize: number;
        sampleRate: number;
        latencyTarget: number;
        enableLogging: boolean;
        logLevel: "error" | "debug" | "info" | "warn";
        defaultOutputPort?: string | undefined;
    }, {
        defaultOutputPort?: string | undefined;
        bufferSize?: number | undefined;
        sampleRate?: number | undefined;
        latencyTarget?: number | undefined;
        enableLogging?: boolean | undefined;
        logLevel?: "error" | "debug" | "info" | "warn" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    version: string;
    enableInspector: boolean;
    maxConcurrentConnections: number;
    midi: {
        bufferSize: number;
        sampleRate: number;
        latencyTarget: number;
        enableLogging: boolean;
        logLevel: "error" | "debug" | "info" | "warn";
        defaultOutputPort?: string | undefined;
    };
    port?: number | undefined;
}, {
    midi: {
        defaultOutputPort?: string | undefined;
        bufferSize?: number | undefined;
        sampleRate?: number | undefined;
        latencyTarget?: number | undefined;
        enableLogging?: boolean | undefined;
        logLevel?: "error" | "debug" | "info" | "warn" | undefined;
    };
    name?: string | undefined;
    version?: string | undefined;
    port?: number | undefined;
    enableInspector?: boolean | undefined;
    maxConcurrentConnections?: number | undefined;
}>;
export declare const ToolResultSchema: z.ZodObject<{
    content: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
    }, {
        type: "text";
        text: string;
    }>, "many">;
    isError: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    content: {
        type: "text";
        text: string;
    }[];
    isError?: boolean | undefined;
}, {
    content: {
        type: "text";
        text: string;
    }[];
    isError?: boolean | undefined;
}>;
export declare const HealthCheckSchema: z.ZodObject<{
    status: z.ZodEnum<["healthy", "degraded", "unhealthy"]>;
    timestamp: z.ZodDate;
    checks: z.ZodObject<{
        midi: z.ZodObject<{
            portsAvailable: z.ZodBoolean;
            defaultPortConnected: z.ZodBoolean;
            latency: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            portsAvailable: boolean;
            defaultPortConnected: boolean;
            latency?: number | undefined;
        }, {
            portsAvailable: boolean;
            defaultPortConnected: boolean;
            latency?: number | undefined;
        }>;
        memory: z.ZodObject<{
            usage: z.ZodNumber;
            limit: z.ZodNumber;
            healthy: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            healthy: boolean;
            usage: number;
            limit: number;
        }, {
            healthy: boolean;
            usage: number;
            limit: number;
        }>;
        performance: z.ZodObject<{
            averageLatency: z.ZodNumber;
            targetLatency: z.ZodNumber;
            healthy: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            healthy: boolean;
            averageLatency: number;
            targetLatency: number;
        }, {
            healthy: boolean;
            averageLatency: number;
            targetLatency: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        midi: {
            portsAvailable: boolean;
            defaultPortConnected: boolean;
            latency?: number | undefined;
        };
        memory: {
            healthy: boolean;
            usage: number;
            limit: number;
        };
        performance: {
            healthy: boolean;
            averageLatency: number;
            targetLatency: number;
        };
    }, {
        midi: {
            portsAvailable: boolean;
            defaultPortConnected: boolean;
            latency?: number | undefined;
        };
        memory: {
            healthy: boolean;
            usage: number;
            limit: number;
        };
        performance: {
            healthy: boolean;
            averageLatency: number;
            targetLatency: number;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: Date;
    checks: {
        midi: {
            portsAvailable: boolean;
            defaultPortConnected: boolean;
            latency?: number | undefined;
        };
        memory: {
            healthy: boolean;
            usage: number;
            limit: number;
        };
        performance: {
            healthy: boolean;
            averageLatency: number;
            targetLatency: number;
        };
    };
}, {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: Date;
    checks: {
        midi: {
            portsAvailable: boolean;
            defaultPortConnected: boolean;
            latency?: number | undefined;
        };
        memory: {
            healthy: boolean;
            usage: number;
            limit: number;
        };
        performance: {
            healthy: boolean;
            averageLatency: number;
            targetLatency: number;
        };
    };
}>;
export declare const RateLimitSchema: z.ZodObject<{
    maxRequests: z.ZodDefault<z.ZodNumber>;
    windowMs: z.ZodDefault<z.ZodNumber>;
    enabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    maxRequests: number;
    windowMs: number;
    enabled: boolean;
}, {
    maxRequests?: number | undefined;
    windowMs?: number | undefined;
    enabled?: boolean | undefined;
}>;
export declare const CacheConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    maxEntries: z.ZodDefault<z.ZodNumber>;
    ttlSeconds: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    maxEntries: number;
    ttlSeconds: number;
}, {
    enabled?: boolean | undefined;
    maxEntries?: number | undefined;
    ttlSeconds?: number | undefined;
}>;
export declare function createErrorResponse(code: string, message: string, details?: any): {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp?: Date | undefined;
};
export declare function createSuccessResponse(data?: any, message?: string): {
    success: true;
    message?: string | undefined;
    data?: any;
    timestamp?: Date | undefined;
};
export declare function createToolResult(text: string, isError?: boolean): {
    content: {
        type: "text";
        text: string;
    }[];
    isError?: boolean | undefined;
};
export declare const ErrorCodes: {
    readonly MIDI_PORT_NOT_FOUND: "MIDI_PORT_NOT_FOUND";
    readonly MIDI_CONNECTION_FAILED: "MIDI_CONNECTION_FAILED";
    readonly MIDI_SEND_FAILED: "MIDI_SEND_FAILED";
    readonly MIDI_INVALID_NOTE: "MIDI_INVALID_NOTE";
    readonly MIDI_INVALID_CONTROLLER: "MIDI_INVALID_CONTROLLER";
    readonly MUSIC_INVALID_CHORD: "MUSIC_INVALID_CHORD";
    readonly MUSIC_INVALID_SCALE: "MUSIC_INVALID_SCALE";
    readonly MUSIC_INVALID_TIME_SIGNATURE: "MUSIC_INVALID_TIME_SIGNATURE";
    readonly MUSIC_INVALID_TEMPO: "MUSIC_INVALID_TEMPO";
    readonly SYSTEM_INITIALIZATION_FAILED: "SYSTEM_INITIALIZATION_FAILED";
    readonly SYSTEM_RESOURCE_EXHAUSTED: "SYSTEM_RESOURCE_EXHAUSTED";
    readonly SYSTEM_TIMEOUT: "SYSTEM_TIMEOUT";
    readonly VALIDATION_FAILED: "VALIDATION_FAILED";
    readonly SCHEMA_VALIDATION_FAILED: "SCHEMA_VALIDATION_FAILED";
    readonly TOOL_EXECUTION_FAILED: "TOOL_EXECUTION_FAILED";
    readonly TOOL_INVALID_PARAMETERS: "TOOL_INVALID_PARAMETERS";
    readonly TOOL_NOT_FOUND: "TOOL_NOT_FOUND";
};
export declare const SuccessMessages: {
    readonly MIDI_PORT_CONNECTED: "MIDI port connected successfully";
    readonly MIDI_NOTE_SENT: "MIDI note sent successfully";
    readonly MIDI_SEQUENCE_EXECUTED: "MIDI sequence executed successfully";
    readonly MIDI_TRANSPORT_CONTROLLED: "MIDI transport controlled successfully";
    readonly CONFIGURATION_UPDATED: "Configuration updated successfully";
    readonly SYSTEM_INITIALIZED: "System initialized successfully";
};
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type Response = z.infer<typeof ResponseSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;
export type MidiConfig = z.infer<typeof MidiConfigSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type ToolResult = z.infer<typeof ToolResultSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;
export type RateLimit = z.infer<typeof RateLimitSchema>;
export type CacheConfig = z.infer<typeof CacheConfigSchema>;
//# sourceMappingURL=common-schemas.d.ts.map