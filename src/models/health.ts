/** Operational state reported by erebus-api. Mirrors the API's own union. */
export type ApiStatus = 'ok' | 'degraded';

/**
 * Health snapshot of erebus-api. Not a catalogue entity: no id, no provenance —
 * the payload is operational and exempt by the API's ADR-002 (LLD §12.5).
 */
export interface HealthStatus {
  status: ApiStatus;
  /** Version string reported by the API; never empty. */
  version: string;
  /** Milliseconds since the API process started; integer, never negative. */
  uptimeMs: number;
}
