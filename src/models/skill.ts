import type { Provenance } from './provenance';

/**
 * The eight canonical Daemon base attributes, by their manual codes.
 *
 * Values are the API's own strings (`AGI`, `CAR`, …) so no translation table is
 * needed; the keys name them in English for readable call sites.
 */
export const BaseAttribute = {
  Agility: 'AGI',
  Charisma: 'CAR',
  Constitution: 'CON',
  Dexterity: 'DEX',
  Strength: 'FR',
  Intelligence: 'INT',
  Perception: 'PER',
  Willpower: 'WILL',
} as const;
export type BaseAttribute = (typeof BaseAttribute)[keyof typeof BaseAttribute];

/**
 * A Daemon skill (pt-BR: "perícia") as the application renders it.
 *
 * The hierarchy is exactly two levels: a root group and its subgroups. Three of
 * its states are **canonical, not missing data**, and the View renders each as
 * content rather than as an error (LLD §6.3):
 *
 * 1. `parentSkillId === null && hasSubgroups === false` — a root leaf, playable
 *    on its own (`Explosivos`, `Esquiva`).
 * 2. `baseAttribute === null && effectiveBaseAttribute === null` — no governing
 *    attribute at all (`Explosivos`: highly technical, always starts at 0%).
 * 3. `hasSubgroups === true` with no children cannot occur — the API derives the
 *    flag from the actual children, so `Artífice` arrives as a leaf with its
 *    divergence recorded in `notes`.
 */
export interface Skill extends Provenance {
  id: number;
  /** Portuguese, because it is domain data and not code (LLD §0). */
  name: string;
  parentSkillId: number | null;
  /** Denormalised by the API so a detail route renders "group → subgroup"
   *  without a second request. Null exactly when `parentSkillId` is null. */
  parentSkillName: string | null;
  /** A group with subgroups is NOT purchasable — the View MUST surface this. */
  hasSubgroups: boolean;
  baseAttribute: BaseAttribute | null;
  /** Resolved by the API as `baseAttribute ?? parent.baseAttribute`. */
  effectiveBaseAttribute: BaseAttribute | null;
  /** The N3 classification (pt-BR: "categoria"). Non-null only for subgroups of
   *  `Condução`, where it is `'condução'` or `'pilotagem'`. An adjective on the
   *  subgroup, never a third hierarchy level. */
  category: string | null;
  /** One-sentence canonical description, in Portuguese. */
  description: string | null;
  initialValueType: string | null;
  prerequisite: string | null;
  damage: string | null;
  notes: string | null;
}

/** Returned only by `GET /v1/skills/:id`. `subgroups` is always an array. */
export interface SkillDetail extends Skill {
  subgroups: Skill[];
}
