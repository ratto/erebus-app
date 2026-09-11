import { useCallback, useEffect, useMemo } from 'react';
import type { ApiError } from '@/models/api-error';
import { ApiErrorKind } from '@/models/api-error';
import type { SkillDetail } from '@/models/skill';
import { groupSubgroupsByCategory } from '@/models/skill.filter';
import type { SkillCategoryNode } from '@/models/skill.filter';
import { skillGateway } from '@/models/skill.gateway';
import type { SkillGateway } from '@/models/skill.gateway';
import { logger } from '@/services/logger';
import { notify } from '@/services/notification';
import { useAsyncResource } from './use-async-resource';
import type { ResourceStatus } from './use-async-resource';

export interface SkillOptions {
  /** Test seam — production callers never pass this (LLD §4.2 rule 6). */
  gateway?: SkillGateway;
}

/** Everything a View may know about one skill. Nothing else. */
export interface SkillViewModel {
  item: SkillDetail | null;
  /**
   * The item's subgroups grouped under their N3 category — the only place the
   * Condução classification surfaces. Empty for a leaf and while loading.
   *
   * An **addition** to CONTRACT §3.5's shape, not a change to one of its keys:
   * the alternative was deriving the grouping in the View, which LLD §4.2 rule 4
   * and §8.2 forbid.
   */
  subgroupsByCategory: SkillCategoryNode[];
  status: ResourceStatus;
  error: ApiError | null;
  /** The failure was a 404 — the skill does not exist, nothing is broken. */
  notFound: boolean;
  reload: () => void;
}

/** Copy is chosen from the failure kind — never from a message or a detail. */
const FAILURE_COPY: Record<ApiErrorKind, string> = {
  [ApiErrorKind.Network]: 'This skill could not be reached.',
  [ApiErrorKind.Timeout]: 'Loading this skill took too long.',
  [ApiErrorKind.Contract]: 'This skill arrived in an unexpected shape.',
  [ApiErrorKind.NotFound]: 'This skill no longer exists.',
  [ApiErrorKind.Validation]: 'This skill could not be loaded.',
  [ApiErrorKind.Server]: 'This skill could not be loaded.',
};

/**
 * ViewModel factory for one skill and its subgroups.
 *
 * Fires once per id, with no automatic retry: recovery is the user's action
 * through `reload` (LLD §12.4). A failure produces both the inline state the
 * View renders and exactly one toast (LLD §12.3).
 */
export function useSkill(id: number, options: SkillOptions = {}): SkillViewModel {
  const { gateway = skillGateway } = options;

  const fetcher = useCallback((signal: AbortSignal) => gateway.findById(id, signal), [gateway, id]);
  const { data, status, error, reload } = useAsyncResource(fetcher, [fetcher]);

  useEffect(() => {
    if (error === null) return;
    logger.error('A skill could not be loaded.', {
      kind: error.kind,
      status: error.status,
      route: `/skills/${id}`,
    });
    notify.error(FAILURE_COPY[error.kind]);
  }, [error, id]);

  const subgroupsByCategory = useMemo(
    () => groupSubgroupsByCategory(data?.subgroups ?? []),
    [data],
  );

  return {
    item: data,
    subgroupsByCategory,
    status,
    error,
    notFound: error?.kind === ApiErrorKind.NotFound,
    reload,
  };
}
