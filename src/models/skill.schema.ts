import { z } from 'zod';
import { provenanceSchema } from './provenance.schema';
import { BaseAttribute } from './skill';

/**
 * `baseAttribute` IS enumerated, deliberately: the app's `BaseAttribute` union
 * drives the filter control, so an unknown attribute is a genuine contract
 * violation rather than new data (CONTRACT §3.4 D20).
 */
const baseAttributeSchema = z.enum(BaseAttribute);

/**
 * Contract tripwire for one element of `GET /v1/skills` (CONTRACT §2.1).
 *
 * `category` and `initialValueType` are plain nullable strings, **not** enums: a
 * new Condução category or a third `initialValueType` is a data addition, and
 * enumerating them would turn it into a hard client-side failure.
 */
export const skillDtoSchema = provenanceSchema.extend({
  id: z.number().int().positive(),
  name: z.string().min(1),
  parentSkillId: z.number().int().positive().nullable(),
  parentSkillName: z.string().min(1).nullable(),
  hasSubgroups: z.boolean(),
  baseAttribute: baseAttributeSchema.nullable(),
  effectiveBaseAttribute: baseAttributeSchema.nullable(),
  category: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  initialValueType: z.string().nullable().default(null),
  prerequisite: z.string().nullable().default(null),
  damage: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
});

/** The whole catalogue, as `GET /v1/skills` returns it: a raw JSON array. */
export const skillListDtoSchema = z.array(skillDtoSchema);

/**
 * Contract tripwire for `GET /v1/skills/:id` (CONTRACT §2.2).
 *
 * `Skill` is one of the two entities whose detail payload is a superset of the
 * list shape, so it carries a second schema in this same file — a documented
 * specialisation of the reference slice, not a new pattern (LLD §6.3).
 * `subgroups` is required: the API always sends the array, `[]` for a leaf.
 */
export const skillDetailDtoSchema = skillDtoSchema.extend({
  subgroups: z.array(skillDtoSchema),
});

export type SkillDto = z.infer<typeof skillDtoSchema>;
export type SkillDetailDto = z.infer<typeof skillDetailDtoSchema>;
