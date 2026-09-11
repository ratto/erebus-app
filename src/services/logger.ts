/**
 * Structured console logging. Phase 1 logs to the console only — no external
 * service (HLD, LLD §12.1). `console.log` MUST NOT survive review.
 */
export const logger = {
  error(message: string, context: Record<string, unknown> = {}): void {
    console.error(JSON.stringify({ level: 'error', message, ...context }));
  },
};
