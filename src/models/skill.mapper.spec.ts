import { describe, expect, it } from 'vitest';
import type { SkillDetailDto, SkillDto } from './skill.schema';
import { toSkill, toSkillDetail } from './skill.mapper';

const buildSkillDto = (overrides: Partial<SkillDto> = {}): SkillDto => ({
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

describe('toSkill', () => {
  it('maps every field of the DTO onto the entity', () => {
    expect(toSkill(buildSkillDto())).toEqual({
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
    });
  });

  it('preserves every nullable field as null rather than dropping it', () => {
    const skill = toSkill(
      buildSkillDto({
        parentSkillId: null,
        parentSkillName: null,
        baseAttribute: null,
        effectiveBaseAttribute: null,
        category: null,
        description: null,
        initialValueType: null,
        editionOrVersion: null,
      }),
    );

    expect(skill).toMatchObject({
      parentSkillId: null,
      parentSkillName: null,
      baseAttribute: null,
      effectiveBaseAttribute: null,
      category: null,
      description: null,
      initialValueType: null,
      editionOrVersion: null,
    });
  });

  it('preserves the provenance of a community record', () => {
    const skill = toSkill(buildSkillDto({ sourceLevel: 3, source: 'homebrew.json' }));

    expect(skill.sourceLevel).toBe(3);
    expect(skill.source).toBe('homebrew.json');
  });

  it('carries the divergence note of a group flagged with subgroups it does not catalogue', () => {
    const skill = toSkill(
      buildSkillDto({ name: 'Artífice', hasSubgroups: false, notes: 'A fonte canônica…' }),
    );

    expect(skill.hasSubgroups).toBe(false);
    expect(skill.notes).toBe('A fonte canônica…');
  });
});

describe('toSkillDetail', () => {
  const buildDetailDto = (overrides: Partial<SkillDetailDto> = {}): SkillDetailDto => ({
    ...buildSkillDto({
      id: 12,
      name: 'Condução',
      parentSkillId: null,
      parentSkillName: null,
      hasSubgroups: true,
      category: null,
    }),
    subgroups: [buildSkillDto()],
    ...overrides,
  });

  it('maps the group itself exactly as toSkill does', () => {
    const detail = toSkillDetail(buildDetailDto());

    expect(detail).toMatchObject({ id: 12, name: 'Condução', hasSubgroups: true });
  });

  it('maps every subgroup element-wise', () => {
    const detail = toSkillDetail(
      buildDetailDto({ subgroups: [buildSkillDto(), buildSkillDto({ id: 42, name: 'Ônibus' })] }),
    );

    expect(detail.subgroups).toHaveLength(2);
    expect(detail.subgroups[1]).toMatchObject({ id: 42, name: 'Ônibus', category: 'condução' });
  });

  it('maps a leaf to an empty subgroups array, never to null', () => {
    const detail = toSkillDetail(buildDetailDto({ hasSubgroups: false, subgroups: [] }));

    expect(detail.subgroups).toEqual([]);
  });
});
