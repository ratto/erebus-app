import { useCallback, useEffect, useMemo } from 'react';
import type { ApiError } from '@/models/api-error';
import { ApiErrorKind } from '@/models/api-error';
import type { SourceLevel } from '@/models/provenance';
import type { BaseAttribute, Skill } from '@/models/skill';
import {
  emptySkillFilter,
  groupSkillsByParent,
  matchesSkillFilter,
  parseSkillFilter,
  serialiseSkillFilter,
} from '@/models/skill.filter';
import type { SkillFilter, SkillGroupNode } from '@/models/skill.filter';
import { skillGateway } from '@/models/skill.gateway';
import type { SkillGateway } from '@/models/skill.gateway';
import { logger } from '@/services/logger';
import { notify } from '@/services/notification';
import { useAsyncResource } from './use-async-resource';
import type { ResourceStatus } from './use-async-resource';
import { useFilterState } from './use-filter-state';

export interface SkillsOptions {
  /** Keep the filter in the URL. Set false when the consumer does not own it. */
  urlSync?: boolean;
  /** Test seam — production callers never pass this (LLD §4.2 rule 6). */
  gateway?: SkillGateway;
}

/** Everything a View may know about the skills catalogue. Nothing else. */
export interface SkillsViewModel {
  /** Filtered and sorted, flat. */
  items: Skill[];
  /** Filtered and sorted, as group → subgroup nodes. */
  groups: SkillGroupNode[];
  total: number;
  matchCount: number;
  /** Ready with no match — distinct from "still loading". */
  isEmpty: boolean;
  isFiltered: boolean;
  status: ResourceStatus;
  error: ApiError | null;
  filter: SkillFilter;
  /** The attributes actually present, for the filter control. */
  baseAttributeOptions: BaseAttribute[];
  setName: (name: string) => void;
  setSourceLevel: (sourceLevel: SourceLevel | null) => void;
  setBaseAttribute: (baseAttribute: BaseAttribute | null) => void;
  clearFilters: () => void;
  reload: () => void;
}

/** Copy is chosen from the failure kind — never from a message or a detail. */
const FAILURE_COPY: Record<ApiErrorKind, string> = {
  [ApiErrorKind.Network]: 'The skills catalogue could not be reached.',
  [ApiErrorKind.Timeout]: 'Loading the skills catalogue took too long.',
  [ApiErrorKind.Contract]: 'The skills catalogue arrived in an unexpected shape.',
  [ApiErrorKind.NotFound]: 'The skills catalogue is unavailable.',
  [ApiErrorKind.Validation]: 'The skills catalogue could not be loaded.',
  [ApiErrorKind.Server]: 'The skills catalogue could not be loaded.',
};

/**
 * ViewModel factory for the skills catalogue.
 *
 * Fetches the whole collection once, then searches and filters in memory — no
 * request per keystroke (LLD §4.6, PLAN D8). Scoped to the domain, not to a
 * page: any number of components MAY call it.
 *
 * Everything the View would otherwise have to derive is derived here: sorting
 * (Portuguese collation, because the data is Portuguese), the group → subgroup
 * hierarchy, the attribute options of the filter control, and the distinction
 * between "no data" and "no matches".
 */
export function useSkills(options: SkillsOptions = {}): SkillsViewModel {
  const { urlSync = true, gateway = skillGateway } = options;

  const { filter, patch, clear } = useFilterState<SkillFilter>({
    empty: emptySkillFilter,
    parse: parseSkillFilter,
    serialise: serialiseSkillFilter,
    urlSync,
  });

  const fetcher = useCallback((signal: AbortSignal) => gateway.list(signal), [gateway]);
  const { data, status, error, reload } = useAsyncResource(fetcher, [fetcher]);

  useEffect(() => {
    if (error === null) return;
    logger.error('The skills catalogue could not be loaded.', {
      kind: error.kind,
      status: error.status,
      route: '/skills',
    });
    notify.error(FAILURE_COPY[error.kind]);
  }, [error]);

  const all = useMemo(() => data ?? [], [data]);

  const items = useMemo(
    () =>
      all
        .filter((skill) => matchesSkillFilter(skill, filter))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [all, filter],
  );

  const groups = useMemo(() => groupSkillsByParent(items), [items]);

  const baseAttributeOptions = useMemo(() => {
    const present = all
      .map((skill) => skill.effectiveBaseAttribute)
      .filter((attribute): attribute is BaseAttribute => attribute !== null);

    return [...new Set(present)].sort();
  }, [all]);

  const isFiltered =
    filter.name !== '' || filter.sourceLevel !== null || filter.baseAttribute !== null;

  return {
    items,
    groups,
    total: all.length,
    matchCount: items.length,
    isEmpty: status === 'ready' && items.length === 0,
    isFiltered,
    status,
    error,
    filter,
    baseAttributeOptions,
    setName: useCallback((name: string) => patch({ name }), [patch]),
    setSourceLevel: useCallback(
      (sourceLevel: SourceLevel | null) => patch({ sourceLevel }),
      [patch],
    ),
    setBaseAttribute: useCallback(
      (baseAttribute: BaseAttribute | null) => patch({ baseAttribute }),
      [patch],
    ),
    clearFilters: clear,
    reload,
  };
}
