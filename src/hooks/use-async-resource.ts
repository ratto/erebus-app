import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError } from '@/models/api-error';
import type { ApiError } from '@/models/api-error';

export type ResourceStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AsyncResource<T> {
  data: T | null;
  status: ResourceStatus;
  error: ApiError | null;
  reload: () => void;
}

/**
 * Runs an async fetcher on mount and on demand, tracking status and error, and
 * aborting the in-flight request on unmount or re-run. Internal to the ViewModel
 * layer — a View MUST NOT import this (LLD §7.5).
 */
export function useAsyncResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
): AsyncResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ResourceStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  // The "latest ref" of LLD §7.5: `deps` — not the fetcher's identity — decides
  // when the request re-runs. eslint-plugin-react-hooks v7 (pinned by the
  // scaffold) rejects the write during render; the LLD snippet is normative and
  // is kept verbatim. Escalated to tech-lead: either §7.5 changes or the rule is
  // scoped out of the flat recommended set.
  // eslint-disable-next-line react-hooks/refs
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // Entering the loading state is the effect's whole purpose here; the v7
    // `set-state-in-effect` rule flags every data-fetching primitive. Same
    // escalation as above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('loading');
    setError(null);

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (!active) return;
        setData(result);
        setStatus('ready');
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(toApiError(cause));
        setStatus('error');
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, status, error, reload };
}
