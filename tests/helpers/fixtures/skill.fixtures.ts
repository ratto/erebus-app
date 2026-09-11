import type { SkillDto } from '@/models/skill.schema';

/**
 * A curated, hand-picked slice of the real `GET /v1/skills` response.
 *
 * Every object below is copied **verbatim** from a manual `GET /v1/skills`
 * run against a locally migrated + seeded `erebus-api`
 * (`feature/us03-consultar-pericias`, 2026-09-11) — not hand-written from
 * `CONTRACT.md` — closing PLAN.md risk R12 for the app-side fixtures. No
 * field was renamed, added or removed; only the 246-row catalogue was
 * narrowed down to the 13 records these suites need. This same JSON is
 * duplicated (kept in sync by hand) as `skills.raw.json`, which
 * `tests/e2e/helpers/skills-api-stub.mjs` reads directly, since the E2E stub
 * is a plain Node script with no TypeScript build step.
 *
 * - `Condução` (id 11): a **group** (`hasSubgroups: true`) whose subgroups
 *   carry the N3 `category` (AC 6).
 * - `Asa Delta` / `Avião Comercial` (category `'pilotagem'`) and `Automóvel`
 *   (category `'condução'`): Condução's own subgroups.
 * - `Explosivos` (id 19): a root **leaf** with no group and no base
 *   attribute — a canonical state, not missing data (AC 8, SPEC note).
 * - `Artífice` (id 6): a root **leaf** carrying its divergence note (AC 8).
 * - `Esquiva` (id 16): an ordinary root leaf, used as filler / search target.
 * - `Adagas` (id 42): a leaf under a *different* group (`Armas Brancas`),
 *   used to prove a name/attribute filter does not leak across groups.
 * - `Animais` (id 1) with `Montaria` / `Treinamento de animais`: a group with
 *   **no base attribute of its own**, exercising `effectiveBaseAttribute`
 *   inheritance (`Montaria` has its own AGI; `Treinamento de animais` has
 *   neither its own nor an inherited attribute).
 * - `Esportes` (id 17) with `Acrobacia`: a second group/subgroup pair, used
 *   to prove the hierarchy renders more than one group at once.
 */
export const rawSkillFixtures: SkillDto[] = [
  {
    id: 11,
    name: 'Condução',
    parentSkillId: null,
    parentSkillName: null,
    hasSubgroups: true,
    baseAttribute: 'AGI',
    effectiveBaseAttribute: 'AGI',
    category: null,
    description:
      'Group skill for operating vehicles; its subgroups split between ordinary driving and specialised piloting.',
    initialValueType: 'instinctive',
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → lista · manual l.809',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 139,
    name: 'Asa Delta',
    parentSkillId: 11,
    parentSkillName: 'Condução',
    hasSubgroups: false,
    baseAttribute: 'AGI',
    effectiveBaseAttribute: 'AGI',
    category: 'pilotagem',
    description: 'Pilot a hang glider; requires specialised training.',
    initialValueType: 'instinctive',
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → Condução.subgrupos · manual l.809',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 121,
    name: 'Automóvel',
    parentSkillId: 11,
    parentSkillName: 'Condução',
    hasSubgroups: false,
    baseAttribute: 'AGI',
    effectiveBaseAttribute: 'AGI',
    category: 'condução',
    description: 'Drive a car under ordinary traffic and operating conditions.',
    initialValueType: 'instinctive',
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → Condução.subgrupos · manual l.809',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 131,
    name: 'Avião Comercial',
    parentSkillId: 11,
    parentSkillName: 'Condução',
    hasSubgroups: false,
    baseAttribute: 'AGI',
    effectiveBaseAttribute: 'AGI',
    category: 'pilotagem',
    description: 'Pilot a commercial aeroplane; requires specialised training.',
    initialValueType: 'instinctive',
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → Condução.subgrupos · manual l.809',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 19,
    name: 'Explosivos',
    parentSkillId: null,
    parentSkillName: null,
    hasSubgroups: false,
    baseAttribute: null,
    effectiveBaseAttribute: null,
    category: null,
    description:
      'Prepare, place and detonate explosive charges safely. Highly technical: starts at 0%.',
    initialValueType: 'technical',
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → lista · manual l.830',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 6,
    name: 'Artífice',
    parentSkillId: null,
    parentSkillName: null,
    hasSubgroups: false,
    baseAttribute: 'DEX',
    effectiveBaseAttribute: 'DEX',
    category: null,
    description:
      'Group skill for crafting trades. The canonical data lists no subgroups: they must be defined with the GM.',
    initialValueType: 'instinctive',
    prerequisite: null,
    damage: null,
    notes:
      'A fonte canônica marca temSubgrupos: true mas não cataloga nenhum subgrupo; os subgrupos são definidos com o Mestre.',
    sourceLevel: 1,
    source: 'pericias.json → lista · manual l.796',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 16,
    name: 'Esquiva',
    parentSkillId: null,
    parentSkillName: null,
    hasSubgroups: false,
    baseAttribute: 'AGI',
    effectiveBaseAttribute: 'AGI',
    category: null,
    description:
      'Dodging blows. Used as the defence value when the character merely evades; it can NEVER be used against arrows or ranged weapons.',
    initialValueType: 'instinctive',
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → lista · manual l.822',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 42,
    name: 'Adagas',
    parentSkillId: 3,
    parentSkillName: 'Armas Brancas',
    hasSubgroups: false,
    baseAttribute: 'DEX',
    effectiveBaseAttribute: 'DEX',
    category: null,
    description:
      'Melee combat with daggers; a combat skill with separate attack and defence values (DEX-based).',
    initialValueType: 'instinctive',
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → Armas Brancas.subgrupos · manual l.786',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 1,
    name: 'Animais',
    parentSkillId: null,
    parentSkillName: null,
    hasSubgroups: true,
    baseAttribute: null,
    effectiveBaseAttribute: null,
    category: null,
    description:
      'Group skill covering the handling, raising and knowledge of animals; the player picks one subgroup.',
    initialValueType: null,
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → lista · manual l.781',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 38,
    name: 'Montaria',
    parentSkillId: 1,
    parentSkillName: 'Animais',
    hasSubgroups: false,
    baseAttribute: 'AGI',
    effectiveBaseAttribute: 'AGI',
    category: null,
    description: 'Ride and control mounts, including over rough ground or in combat.',
    initialValueType: 'instinctive',
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → Animais.subgrupos · manual l.781',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 37,
    name: 'Treinamento de animais',
    parentSkillId: 1,
    parentSkillName: 'Animais',
    hasSubgroups: false,
    baseAttribute: null,
    effectiveBaseAttribute: null,
    category: null,
    description: 'Teach commands and tricks to already domesticated animals.',
    initialValueType: 'technical',
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → Animais.subgrupos · manual l.781',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 152,
    name: 'Acrobacia',
    parentSkillId: 17,
    parentSkillName: 'Esportes',
    hasSubgroups: false,
    baseAttribute: 'AGI',
    effectiveBaseAttribute: 'AGI',
    category: null,
    description: 'Jumps, tumbles, balance and acrobatic movement.',
    initialValueType: 'instinctive',
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → Esportes.subgrupos · manual l.824',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
  {
    id: 17,
    name: 'Esportes',
    parentSkillId: null,
    parentSkillName: null,
    hasSubgroups: true,
    baseAttribute: null,
    effectiveBaseAttribute: null,
    category: null,
    description:
      'Group skill for athletic and sporting practice; each discipline is a subgroup with its own base atributo.',
    initialValueType: null,
    prerequisite: null,
    damage: null,
    notes: null,
    sourceLevel: 1,
    source: 'pericias.json → lista · manual l.824',
    editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  },
];

const byName = (name: string): SkillDto => {
  const found = rawSkillFixtures.find((skill) => skill.name === name);
  if (found === undefined) throw new Error(`No fixture named "${name}" — check skill.fixtures.ts`);
  return found;
};

export const conducaoDto = byName('Condução');
export const asaDeltaDto = byName('Asa Delta');
export const automovelDto = byName('Automóvel');
export const aviaoComercialDto = byName('Avião Comercial');
export const explosivosDto = byName('Explosivos');
export const artificeDto = byName('Artífice');
export const esquivaDto = byName('Esquiva');
export const adagasDto = byName('Adagas');
export const animaisDto = byName('Animais');
export const montariaDto = byName('Montaria');
export const treinamentoDeAnimaisDto = byName('Treinamento de animais');
export const acrobaciaDto = byName('Acrobacia');
export const esportesDto = byName('Esportes');

/** The full catalogue slice, exactly as `GET /v1/skills` would return it. */
export const skillListFixture: SkillDto[] = [...rawSkillFixtures];

/**
 * Builds a `GET /v1/skills/:id` detail payload for `Condução`, subgroups
 * sorted by name ASC as the real endpoint does (CONTRACT §2.2).
 */
export function buildConducaoDetailDto() {
  return {
    ...conducaoDto,
    subgroups: [asaDeltaDto, automovelDto, aviaoComercialDto].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  };
}

/** A root leaf's detail — `subgroups` is always `[]`, never omitted (§2.2). */
export function buildExplosivosDetailDto() {
  return { ...explosivosDto, subgroups: [] };
}

/** `Artífice`'s detail — a leaf despite the source's divergence, `notes` set. */
export function buildArtificeDetailDto() {
  return { ...artificeDto, subgroups: [] };
}

export function buildAnimaisDetailDto() {
  return {
    ...animaisDto,
    subgroups: [montariaDto, treinamentoDeAnimaisDto].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/** RFC 7807 body for a 404, verbatim shape (CONTRACT §2.2, §2.3). */
export function buildNotFoundProblem(id: number) {
  return {
    type: 'https://erebus.dev/problems/not-found',
    title: 'Resource not found',
    status: 404,
    detail: `Skill with id ${id} was not found.`,
    instance: `/v1/skills/${id}`,
  };
}
