import { z } from 'zod';

/**
 * The provenance fragment every catalogue entity's schema extends (LLD §6.2).
 *
 * `sourceLevel` is a union of the three literals that exist in the database, so
 * a payload carrying `4` fails loudly as `ApiError{ kind: 'contract' }` instead
 * of rendering community homebrew as if it were canonical.
 */
export const provenanceSchema = z.object({
  sourceLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  source: z.string().min(1),
  editionOrVersion: z.string().nullable().default(null),
});

export type ProvenanceDto = z.infer<typeof provenanceSchema>;
