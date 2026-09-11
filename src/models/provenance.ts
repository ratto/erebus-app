/**
 * The three provenance levels that exist in the database.
 *
 * Level 4 (community discussion) is deliberately **not** representable: a
 * payload carrying it is a contract violation, not a fourth level (LLD §6.2).
 */
export const SourceLevel = {
  Canonical: 1,
  Official: 2,
  Community: 3,
} as const;
export type SourceLevel = (typeof SourceLevel)[keyof typeof SourceLevel];

/** Where a record came from. Present on EVERY entity — never optional. */
export interface Provenance {
  sourceLevel: SourceLevel;
  source: string;
  editionOrVersion: string | null;
}
