import { normalise } from './normalise';
import { SourceLevel } from './provenance';
import { BaseAttribute } from './skill';
import type { Skill } from './skill';

export interface SkillFilter {
  name: string;
  sourceLevel: SourceLevel | null;
  baseAttribute: BaseAttribute | null;
}

/** Every facet unset: the filter a listing starts from. */
export const emptySkillFilter: SkillFilter = {
  name: '',
  sourceLevel: null,
  baseAttribute: null,
};

const SOURCE_LEVELS: readonly SourceLevel[] = Object.values(SourceLevel);
const BASE_ATTRIBUTES: readonly BaseAttribute[] = Object.values(BaseAttribute);

const isSourceLevel = (value: number): value is SourceLevel =>
  SOURCE_LEVELS.includes(value as SourceLevel);

const isBaseAttribute = (value: string): value is BaseAttribute =>
  BASE_ATTRIBUTES.includes(value as BaseAttribute);

/**
 * Pure predicate over one skill. Every set facet must match.
 *
 * `baseAttribute` is matched against **`effectiveBaseAttribute`**, the same rule
 * the API applies server-side: a subgroup that inherits AGI from `Condução`
 * carries `baseAttribute: null` and must still be found (CONTRACT §2.1, §3.4).
 */
export function matchesSkillFilter(skill: Skill, filter: SkillFilter): boolean {
  if (filter.name !== '' && !normalise(skill.name).includes(normalise(filter.name))) {
    return false;
  }
  if (filter.sourceLevel !== null && skill.sourceLevel !== filter.sourceLevel) {
    return false;
  }
  if (filter.baseAttribute !== null && skill.effectiveBaseAttribute !== filter.baseAttribute) {
    return false;
  }

  return true;
}

/**
 * URL → filter. Parameter names are the Entity field names (LLD §5.2).
 *
 * A malformed parameter (`?sourceLevel=9`, `?baseAttribute=XYZ`) is ignored and
 * falls back to the default. It never throws and is never sent to the API.
 */
export function parseSkillFilter(params: URLSearchParams): SkillFilter {
  const rawSourceLevel = Number(params.get('sourceLevel'));
  const rawBaseAttribute = params.get('baseAttribute') ?? '';

  return {
    name: params.get('name')?.trim() ?? '',
    sourceLevel: isSourceLevel(rawSourceLevel) ? rawSourceLevel : null,
    baseAttribute: isBaseAttribute(rawBaseAttribute) ? rawBaseAttribute : null,
  };
}

/** Filter → URL. An unset facet is omitted, never written as `?name=`. */
export function serialiseSkillFilter(filter: SkillFilter): URLSearchParams {
  const params = new URLSearchParams();

  if (filter.name !== '') params.set('name', filter.name);
  if (filter.sourceLevel !== null) params.set('sourceLevel', String(filter.sourceLevel));
  if (filter.baseAttribute !== null) params.set('baseAttribute', filter.baseAttribute);

  return params;
}

/** A root skill together with the subgroups it governs. */
export interface SkillGroupNode {
  skill: Skill;
  subgroups: Skill[];
}

/**
 * Collection → two-level hierarchy, the shape the listing is presented in.
 *
 * A pure derivation over Entities, so it lives beside the predicate rather than
 * in a sixth per-entity file (LLD §6.5) and the View never derives it (§4.2
 * rule 4). Total by construction: a childless root yields `subgroups: []`
 * (`Explosivos`, `Artífice`).
 *
 * Input order is preserved, so a caller that sorted the collection gets sorted
 * groups and sorted subgroups for free.
 *
 * A subgroup whose group is absent from the input becomes a node of its own
 * rather than being silently dropped. That is the normal case for a *filtered*
 * collection — searching "Automóvel" matches the subgroup and not its group, and
 * the match must stay visible. In a **full** catalogue payload it would be a
 * contract violation; surfacing it makes that visible instead of hiding it.
 */
/** The subgroups of one group that share an N3 category (`null` when they have none). */
export interface SkillCategoryNode {
  category: string | null;
  subgroups: Skill[];
}

/**
 * Subgroups → their N3 category groups, the shape a group's detail renders.
 *
 * The N3 classification (`Condução` → `'condução'` / `'pilotagem'`) is an
 * adjective on the subgroup rather than a third hierarchy level, and grouping by
 * it is the only place it surfaces in the UI. A pure derivation over Entities,
 * so it lives beside the predicate (LLD §6.5) and the View never derives it.
 *
 * Categories keep their order of first appearance, so a caller that sorted the
 * subgroups gets a stable, sorted presentation.
 */
export function groupSubgroupsByCategory(subgroups: Skill[]): SkillCategoryNode[] {
  const nodes = new Map<string, SkillCategoryNode>();
  const ordered: SkillCategoryNode[] = [];

  for (const skill of subgroups) {
    const key = skill.category ?? '';
    const existing = nodes.get(key);

    if (existing === undefined) {
      const node: SkillCategoryNode = { category: skill.category, subgroups: [skill] };
      nodes.set(key, node);
      ordered.push(node);
      continue;
    }
    existing.subgroups.push(skill);
  }

  return ordered;
}

export function groupSkillsByParent(skills: Skill[]): SkillGroupNode[] {
  const roots = new Map<number, SkillGroupNode>();
  const ordered: SkillGroupNode[] = [];

  for (const skill of skills) {
    if (skill.parentSkillId === null) {
      const node: SkillGroupNode = { skill, subgroups: [] };
      roots.set(skill.id, node);
      ordered.push(node);
    }
  }

  const orphans: SkillGroupNode[] = [];

  for (const skill of skills) {
    if (skill.parentSkillId === null) continue;

    const parent = roots.get(skill.parentSkillId);
    if (parent === undefined) {
      orphans.push({ skill, subgroups: [] });
      continue;
    }
    parent.subgroups.push(skill);
  }

  return [...ordered, ...orphans];
}
