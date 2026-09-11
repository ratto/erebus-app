/**
 * Accent- and case-insensitive form of a value, so "pericia" matches "Perícia".
 *
 * The catalogue is Portuguese and accent-sensitive search would be a usability
 * bug, so LLD §6.5 requires one shared helper rather than a copy per entity
 * filter. It lives in its own Model-layer module — the reference slice writes it
 * inside `melee-weapon.filter.ts`, which would force every other entity filter
 * to import from a sibling entity (PLAN step A7's watch note).
 */
export const normalise = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
