import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface FilterStateOptions<F> {
  /** The neutral filter: every facet unset. */
  empty: F;
  /** Pure reader. A malformed parameter MUST be ignored, never thrown (LLD §5.2). */
  parse: (params: URLSearchParams) => F;
  /** Pure writer. An empty value MUST be omitted, never written as `?name=`. */
  serialise: (filter: F) => URLSearchParams;
  /** Keep the filter in the URL. False for a consumer that does not own the URL. */
  urlSync?: boolean;
}

export interface FilterState<F> {
  filter: F;
  /** Merges a partial filter into the current one. */
  patch: (partial: Partial<F>) => void;
  /** Resets every facet back to `empty`. */
  clear: () => void;
}

/**
 * Keeps a filter in the URL's query string — or in local state when the
 * consumer does not own the URL.
 *
 * Internal ViewModel primitive shared by every entity listing hook (LLD §5.2,
 * §7.6): the URL is the single source of truth when `urlSync` is on, so a
 * deep-linked filter and a typed filter are literally the same state. Writes
 * replace the history entry, so typing in a search field does not push one
 * entry per keystroke, and a malformed parameter is dropped on the next write.
 *
 * A View MUST NOT import this — it consumes an entity hook instead.
 */
export function useFilterState<F>(options: FilterStateOptions<F>): FilterState<F> {
  const { empty, parse, serialise, urlSync = true } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilter, setLocalFilter] = useState<F>(empty);

  const urlFilter = useMemo(() => parse(searchParams), [parse, searchParams]);
  const filter = urlSync ? urlFilter : localFilter;

  const patch = useCallback(
    (partial: Partial<F>) => {
      if (!urlSync) {
        setLocalFilter((current) => ({ ...current, ...partial }));
        return;
      }

      setSearchParams((current) => serialise({ ...parse(current), ...partial }), {
        replace: true,
      });
    },
    [parse, serialise, setSearchParams, urlSync],
  );

  const clear = useCallback(() => {
    if (!urlSync) {
      setLocalFilter(empty);
      return;
    }

    setSearchParams(serialise(empty), { replace: true });
  }, [empty, serialise, setSearchParams, urlSync]);

  return { filter, patch, clear };
}
