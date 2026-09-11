import { z } from 'zod';

/**
 * Contract tripwire for `GET /health`. Unknown extra keys are stripped, so the
 * API may add fields without breaking the app; anything else fails loudly as
 * `ApiError{ kind: 'contract' }` (LLD §6.4, CONTRACT §2).
 */
export const healthDtoSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  version: z.string().min(1),
  uptimeMs: z.number().int().nonnegative(),
});

export type HealthDto = z.infer<typeof healthDtoSchema>;
