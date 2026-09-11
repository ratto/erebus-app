import type { Skill, SkillDetail } from './skill';
import type { SkillDetailDto, SkillDto } from './skill.schema';

/**
 * DTO → Entity. The ONLY place the API vocabulary meets the app vocabulary.
 *
 * Near-identity today, on purpose: it is the seam that absorbs the next API
 * rename without a single `.tsx` file changing (LLD §4.3, §7.3). Returning
 * `dto as Skill` instead is an anti-pattern (LLD §8.4).
 */
export function toSkill(dto: SkillDto): Skill {
  return {
    id: dto.id,
    name: dto.name,
    parentSkillId: dto.parentSkillId,
    parentSkillName: dto.parentSkillName,
    hasSubgroups: dto.hasSubgroups,
    baseAttribute: dto.baseAttribute,
    effectiveBaseAttribute: dto.effectiveBaseAttribute,
    category: dto.category,
    description: dto.description,
    initialValueType: dto.initialValueType,
    prerequisite: dto.prerequisite,
    damage: dto.damage,
    notes: dto.notes,
    sourceLevel: dto.sourceLevel,
    source: dto.source,
    editionOrVersion: dto.editionOrVersion,
  };
}

/** Detail DTO → Entity, mapping `subgroups[]` element-wise (LLD §6.3). */
export function toSkillDetail(dto: SkillDetailDto): SkillDetail {
  return {
    ...toSkill(dto),
    subgroups: dto.subgroups.map(toSkill),
  };
}
