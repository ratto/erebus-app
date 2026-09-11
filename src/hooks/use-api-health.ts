import { useCallback, useEffect } from 'react';
import type { ApiErrorKind } from '@/models/api-error';
import type { ApiStatus } from '@/models/health';
import { healthGateway } from '@/models/health.gateway';
import type { HealthGateway } from '@/models/health.gateway';
import { logger } from '@/services/logger';
import { useAsyncResource } from './use-async-resource';
import type { ResourceStatus } from './use-async-resource';

export interface ApiHealthOptions {
  /** Test seam — production callers never pass this (LLD §4.2 rule 6). */
  gateway?: HealthGateway;
}

/** Everything a View may know about the API's health. Nothing else is exposed. */
export interface ApiHealthViewModel {
  /** Request lifecycle: 'idle' | 'loading' | 'ready' | 'error'. */
  status: ResourceStatus;
  /** The API's own reported state; null until the request succeeds. */
  apiStatus: ApiStatus | null;
  /** API version string; null until the request succeeds. */
  version: string | null;
  /** Classification of the failure, for the View to pick copy from. */
  errorKind: ApiErrorKind | null;
  /** Re-issues the probe on demand. Exposed for uniformity; the badge does not use it. */
  reload: () => void;
}

/**
 * ViewModel factory for the API-health probe.
 *
 * Fires once on mount: no polling and no automatic retry (ADR-003, LLD §12.4).
 * A failure is an ambient condition, not a failed user action, so it logs once
 * and raises **no** toast — the scoped exemption of LLD §12.3.
 */
export function useApiHealth(options: ApiHealthOptions = {}): ApiHealthViewModel {
  const { gateway = healthGateway } = options;

  const fetcher = useCallback((signal: AbortSignal) => gateway.check(signal), [gateway]);
  const { data, status, error, reload } = useAsyncResource(fetcher, [fetcher]);

  useEffect(() => {
    if (error === null) return;
    logger.error('The erebus-api health probe failed.', {
      kind: error.kind,
      status: error.status,
      route: '/health',
    });
  }, [error]);

  return {
    status,
    apiStatus: data?.status ?? null,
    version: data?.version ?? null,
    errorKind: error?.kind ?? null,
    reload,
  };
}
