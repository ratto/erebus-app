import { describe, expect, it } from 'vitest';
import type { Skill } from './skill';
import {
  emptySkillFilter,
  groupSkillsByParent,
  groupSubgroupsByCategory,
  matchesSkillFilter,
  parseSkillFilter,
  serialiseSkillFilter,
} from './skill.filter';

const buildSkill = (overrides: Partial<Skill> = {}): Skill => ({
  id: 41,
  name: 'Automóvel',
  parentSkillId: 12,
  parentSkillName: 'Condução',
  hasSubgroups: false,
  baseAttribute: 'AGI',
  effectiveBaseAttribute: 'AGI',
  category: 'condução',
  description: 'Dirigir automóvel em condições normais de uso e de trânsito.',
  initialValueType: 'instinctive',
  prerequisite: null,
  damage: null,
  notes: null,
  sourceLevel: 1,
  source: 'pericias.json → Condução.subgrupos · manual l.809',
  editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  ...overrides,
});

describe('matchesSkillFilter', () => {
  it('matches everything when no facet is set', () => {
    expect(matchesSkillFilter(buildSkill(), emptySkillFilter)).toBe(true);
  });

  it('matches a partial name', () => {
    expect(matchesSkillFilter(buildSkill(), { ...emptySkillFilter, name: 'auto' })).toBe(true);
  });

  it('matches a name regardless of case and accents', () => {
    expect(matchesSkillFilter(buildSkill(), { ...emptySkillFilter, name: 'AUTOMOVEL' })).toBe(true);
  });

  it('rejects a name that does not occur', () => {
    expect(matchesSkillFilter(buildSkill(), { ...emptySkillFilter, name: 'espada' })).toBe(false);
  });

  it('matches an exact source level', () => {
    expect(matchesSkillFilter(buildSkill(), { ...emptySkillFilter, sourceLevel: 1 })).toBe(true);
  });

  it('rejects a different source level', () => {
    expect(matchesSkillFilter(buildSkill(), { ...emptySkillFilter, sourceLevel: 3 })).toBe(false);
  });

  it('matches the base attribute a subgroup inherits from its group', () => {
    const inheriting = buildSkill({ baseAttribute: null, effectiveBaseAttribute: 'AGI' });

    expect(matchesSkillFilter(inheriting, { ...emptySkillFilter, baseAttribute: 'AGI' })).toBe(
      true,
    );
  });

  it('rejects a different base attribute', () => {
    expect(matchesSkillFilter(buildSkill(), { ...emptySkillFilter, baseAttribute: 'INT' })).toBe(
      false,
    );
  });

  it('rejects a skill with no attribute at all when an attribute is filtered', () => {
    const explosives = buildSkill({ baseAttribute: null, effectiveBaseAttribute: null });

    expect(matchesSkillFilter(explosives, { ...emptySkillFilter, baseAttribute: 'INT' })).toBe(
      false,
    );
  });

  it('requires every set facet to match', () => {
    const filter = { name: 'auto', sourceLevel: 1, baseAttribute: 'INT' } as const;

    expect(matchesSkillFilter(buildSkill(), filter)).toBe(false);
  });
});

describe('parseSkillFilter', () => {
  it('reads every facet from the query string', () => {
    const filter = parseSkillFilter(
      new URLSearchParams('name=cond&sourceLevel=2&baseAttribute=INT'),
    );

    expect(filter).toEqual({ name: 'cond', sourceLevel: 2, baseAttribute: 'INT' });
  });

  it('returns the empty filter when nothing is set', () => {
    expect(parseSkillFilter(new URLSearchParams())).toEqual(emptySkillFilter);
  });

  it('trims the searched name', () => {
    expect(parseSkillFilter(new URLSearchParams('name=%20cond%20')).name).toBe('cond');
  });

  it('drops a source level outside 1–3', () => {
    expect(parseSkillFilter(new URLSearchParams('sourceLevel=9')).sourceLevel).toBeNull();
  });

  it('drops a non-numeric source level', () => {
    expect(parseSkillFilter(new URLSearchParams('sourceLevel=two')).sourceLevel).toBeNull();
  });

  it('drops an unknown base attribute', () => {
    expect(parseSkillFilter(new URLSearchParams('baseAttribute=XYZ')).baseAttribute).toBeNull();
  });
});

describe('serialiseSkillFilter', () => {
  it('writes every set facet', () => {
    const params = serialiseSkillFilter({ name: 'cond', sourceLevel: 2, baseAttribute: 'INT' });

    expect(params.toString()).toBe('name=cond&sourceLevel=2&baseAttribute=INT');
  });

  it('omits an empty name instead of writing ?name=', () => {
    const params = serialiseSkillFilter({ ...emptySkillFilter, sourceLevel: 1 });

    expect(params.has('name')).toBe(false);
    expect(params.toString()).toBe('sourceLevel=1');
  });

  it('writes nothing at all for the empty filter', () => {
    expect(serialiseSkillFilter(emptySkillFilter).toString()).toBe('');
  });

  it('round-trips a filter through the query string', () => {
    const filter = { name: 'automóvel', sourceLevel: 3, baseAttribute: 'AGI' } as const;

    expect(parseSkillFilter(serialiseSkillFilter(filter))).toEqual(filter);
  });
});

describe('groupSkillsByParent', () => {
  const conducao = buildSkill({
    id: 12,
    name: 'Condução',
    parentSkillId: null,
    parentSkillName: null,
    hasSubgroups: true,
    category: null,
  });
  const automovel = buildSkill({ id: 41, name: 'Automóvel' });
  const onibus = buildSkill({ id: 42, name: 'Ônibus' });
  const explosivos = buildSkill({
    id: 7,
    name: 'Explosivos',
    parentSkillId: null,
    parentSkillName: null,
    hasSubgroups: false,
    baseAttribute: null,
    effectiveBaseAttribute: null,
    category: null,
  });

  it('nests every subgroup under its group', () => {
    const groups = groupSkillsByParent([conducao, automovel, onibus]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.skill.name).toBe('Condução');
    expect(groups[0]?.subgroups.map((skill) => skill.name)).toEqual(['Automóvel', 'Ônibus']);
  });

  it('yields an empty subgroup list for a childless root', () => {
    const groups = groupSkillsByParent([explosivos]);

    expect(groups).toEqual([{ skill: explosivos, subgroups: [] }]);
  });

  it('preserves the order in which the roots were given', () => {
    const groups = groupSkillsByParent([conducao, explosivos, automovel]);

    expect(groups.map((node) => node.skill.name)).toEqual(['Condução', 'Explosivos']);
  });

  it('surfaces a subgroup whose group is absent as a node of its own, never dropping it', () => {
    const groups = groupSkillsByParent([automovel]);

    expect(groups).toEqual([{ skill: automovel, subgroups: [] }]);
  });

  it('keeps orphaned subgroups after the groups that are present', () => {
    const groups = groupSkillsByParent([explosivos, automovel]);

    expect(groups.map((node) => node.skill.name)).toEqual(['Explosivos', 'Automóvel']);
  });

  it('returns nothing for an empty collection', () => {
    expect(groupSkillsByParent([])).toEqual([]);
  });
});

describe('groupSubgroupsByCategory', () => {
  const automovel = buildSkill({ id: 41, name: 'Automóvel', category: 'condução' });
  const onibus = buildSkill({ id: 42, name: 'Ônibus', category: 'condução' });
  const aviao = buildSkill({ id: 43, name: 'Avião', category: 'pilotagem' });
  const uncategorised = buildSkill({ id: 44, name: 'Rastrear', category: null });

  it('groups subgroups under their N3 category, in order of first appearance', () => {
    const nodes = groupSubgroupsByCategory([automovel, aviao, onibus]);

    expect(nodes).toEqual([
      { category: 'condução', subgroups: [automovel, onibus] },
      { category: 'pilotagem', subgroups: [aviao] },
    ]);
  });

  it('groups subgroups with no category under a null category', () => {
    const nodes = groupSubgroupsByCategory([uncategorised]);

    expect(nodes).toEqual([{ category: null, subgroups: [uncategorised] }]);
  });

  it('keeps categorised and uncategorised subgroups apart', () => {
    const nodes = groupSubgroupsByCategory([uncategorised, automovel]);

    expect(nodes.map((node) => node.category)).toEqual([null, 'condução']);
  });

  it('returns nothing for a leaf with no subgroups', () => {
    expect(groupSubgroupsByCategory([])).toEqual([]);
  });
});
