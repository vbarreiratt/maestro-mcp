import { z } from 'zod';

export const ScoreMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  composer: z.string(),
  style: z.string(),
  composition_year: z.number().optional(),
  key_signature: z.string().optional(),
  bpm: z.number().optional(),
  time_signature: z.string().default('4/4'),
  difficulty: z.number().min(1).max(10).optional(),
  duration_seconds: z.number().optional(),
  voices_count: z.number().optional(),
  instruments: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  preview_notes: z.string().optional(),
  description: z.string().optional()
});

export const MaestroFormatSchema = z.object({
  bpm: z.number().optional(),
  timeSignature: z.string().optional(),
  key: z.string().optional(),
  voices: z.array(z.object({
    channel: z.number(),
    notes: z.string(),
    velocity: z.number().optional(),
    articulation: z.number().optional(),
    transpose: z.number().optional()
  })).optional(),
  notes: z.string().optional(),
  velocity: z.number().optional(),
  articulation: z.number().optional(),
  transpose: z.number().optional()
}).passthrough();

export const FullScoreSchema = z.object({
  metadata: ScoreMetadataSchema,
  maestro_format: MaestroFormatSchema
});

export const SearchCriteriaSchema = z.object({
  query: z.string().optional(),
  composer: z.string().optional(),
  style: z.string().optional(),
  year: z.number().optional(),
  year_range: z.tuple([z.number(), z.number()]).optional(),
  key: z.string().optional(),
  difficulty: z.number().min(1).max(10).optional(),
  bpm_range: z.tuple([z.number(), z.number()]).optional(),
  limit: z.number().default(10)
});

export const SearchResultSchema = z.object({
  score: ScoreMetadataSchema,
  relevance: z.number(),
  source: z.enum(['local', 'online'])
});

export const LibraryConfigSchema = z.object({
  localDbPath: z.string(),
  vectorDbPath: z.string(),
  onlineEnabled: z.boolean().default(false),
  cacheOnlineResults: z.boolean().default(true),
  syncIntervalHours: z.number().default(24),
  supabase: z.object({
    url: z.string(),
    anonKey: z.string()
  }).optional()
});

export type ScoreMetadata = z.infer<typeof ScoreMetadataSchema>;
export type MaestroFormat = z.infer<typeof MaestroFormatSchema>;
export type FullScore = z.infer<typeof FullScoreSchema>;
export type SearchCriteria = z.infer<typeof SearchCriteriaSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type LibraryConfig = z.infer<typeof LibraryConfigSchema>;