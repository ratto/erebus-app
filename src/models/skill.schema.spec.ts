import { describe, expect, it } from 'vitest';
import { skillDetailDtoSchema, skillDtoSchema, skillListDtoSchema } from './skill.schema';

const buildSkillDto = (overrides: Record<string, unknown> = {}) => ({
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

describe('skillDtoSchema', () => {
  it('accepts the contract payload of a subgroup', () => {
    expect(skillDtoSchema.parse(buildSkillDto())).toMatchObject({
      id: 41,
      name: 'Automóvel',
      parentSkillName: 'Condução',
      category: 'condução',
    });
  });

  it('accepts a root leaf with no parent and no attribute at all', () => {
    const parsed = skillDtoSchema.parse(
      buildSkillDto({
        id: 7,
        name: 'Explosivos',
        parentSkillId: null,
        parentSkillName: null,
        baseAttribute: null,
        effectiveBaseAttribute: null,
        category: null,
      }),
    );

    expect(parsed.parentSkillId).toBeNull();
    expect(parsed.effectiveBaseAttribute).toBeNull();
  });

  it('rejects a payload missing a field the app depends on', () => {
    expect(() => skillDtoSchema.parse({ id: 1, name: 'Condução' })).toThrow();
  });

  it('rejects an unknown base attribute, because the filter control is driven by the union', () => {
    expect(() => skillDtoSchema.parse(buildSkillDto({ baseAttribute: 'XYZ' }))).toThrow();
  });

  it('rejects a source level of 4', () => {
    expect(() => skillDtoSchema.parse(buildSkillDto({ sourceLevel: 4 }))).toThrow();
  });

  it('accepts an unseen category value — a new Condução category is data, not a contract break', () => {
    const parsed = skillDtoSchema.parse(buildSkillDto({ category: 'navegação' }));

    expect(parsed.category).toBe('navegação');
  });

  it('accepts an unseen initialValueType for the same reason', () => {
    const parsed = skillDtoSchema.parse(buildSkillDto({ initialValueType: 'related' }));

    expect(parsed.initialValueType).toBe('related');
  });

  it('strips unknown keys so the API may add fields without breaking the app', () => {
    const parsed = skillDtoSchema.parse(buildSkillDto({ parentBaseAttribute: 'AGI' }));

    expect(parsed).not.toHaveProperty('parentBaseAttribute');
  });

  it('parses a whole collection through the list schema', () => {
    const parsed = skillListDtoSchema.parse([buildSkillDto(), buildSkillDto({ id: 42 })]);

    expect(parsed).toHaveLength(2);
  });
});

describe('skillDetailDtoSchema', () => {
  it('accepts a group with its subgroups', () => {
    const parsed = skillDetailDtoSchema.parse(
      buildSkillDto({
        id: 12,
        name: 'Condução',
        parentSkillId: null,
        parentSkillName: null,
        hasSubgroups: true,
        category: null,
        subgroups: [buildSkillDto()],
      }),
    );

    expect(parsed.subgroups).toHaveLength(1);
    expect(parsed.subgroups[0]?.name).toBe('Automóvel');
  });

  it('accepts a leaf, whose subgroups array is empty but always present', () => {
    const parsed = skillDetailDtoSchema.parse(buildSkillDto({ subgroups: [] }));

    expect(parsed.subgroups).toEqual([]);
  });

  it('rejects a detail payload with no subgroups key — the API always sends the array', () => {
    expect(() => skillDetailDtoSchema.parse(buildSkillDto())).toThrow();
  });

  it('rejects a subgroup element that violates the element contract', () => {
    expect(() =>
      skillDetailDtoSchema.parse(buildSkillDto({ subgroups: [{ id: 1, name: 'X' }] })),
    ).toThrow();
  });
});
