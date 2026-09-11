import { z } from 'zod';

/**
 * The single place `import.meta.env` is read (LLD §12.2). Parsing happens once,
 * at module load: an invalid environment fails the boot naming the offending
 * variables, instead of manifesting later as N identical network errors.
 */
const envSchema = z.object({
  // Absolute URL (preview/production) OR a root-relative path (dev proxy) — ADR-003.
  VITE_API_BASE_URL: z.union([z.url(), z.string().regex(/^\/[^\s]*$/)]),
  VITE_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration: ${parsed.error.issues
      .map((issue) => issue.path.join('.'))
      .join(', ')}`,
  );
}

/** Typed, validated application configuration. */
export const config = {
  /** Base URL of erebus-api, already including the `/v1` prefix. */
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  /** Axios request timeout in milliseconds. */
  requestTimeoutMs: parsed.data.VITE_REQUEST_TIMEOUT_MS,
} as const;
