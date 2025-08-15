export declare const libraryTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            query: {
                type: string;
                description: string;
            };
            composer: {
                type: string;
                description: string;
            };
            style: {
                type: string;
                description: string;
            };
            year: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
            verbose: {
                type: string;
                description: string;
            };
            score_id?: never;
            modifications?: never;
        };
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            score_id: {
                type: string;
                description: string;
            };
            query: {
                type: string;
                description: string;
            };
            modifications: {
                type: string;
                description: string;
            };
            verbose: {
                type: string;
                description: string;
            };
            composer?: never;
            style?: never;
            year?: never;
            limit?: never;
        };
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            verbose: {
                type: string;
                description: string;
            };
            query?: never;
            composer?: never;
            style?: never;
            year?: never;
            limit?: never;
            score_id?: never;
            modifications?: never;
        };
    };
})[];
//# sourceMappingURL=library-tools.d.ts.map