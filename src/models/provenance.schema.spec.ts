import { describe, expect, it } from 'vitest';
import { provenanceSchema } from './provenance.schema';

const buildProvenanceDto = (overrides: Record<string, unknown> = {}) => ({
  sourceLevel: 1,
  source: 'pericias.json → lista · manual l.809',
  editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
  ...overrides,
});

describe('provenanceSchema', () => {
  it('accepts the three levels that exist in the database', () => {
    for (const sourceLevel of [1, 2, 3]) {
      expect(provenanceSchema.parse(buildProvenanceDto({ sourceLevel }))).toMatchObject({
        sourceLevel,
      });
    }
  });

  it('rejects level 4 — community discussion is not representable in the app', () => {
    expect(() => provenanceSchema.parse(buildProvenanceDto({ sourceLevel: 4 }))).toThrow();
  });

  it('rejects an empty source, because provenance must always be renderable', () => {
    expect(() => provenanceSchema.parse(buildProvenanceDto({ source: '' }))).toThrow();
  });

  it('defaults a missing editionOrVersion to null rather than undefined', () => {
    const parsed = provenanceSchema.parse({ sourceLevel: 2, source: 'homebrew.json' });

    expect(parsed.editionOrVersion).toBeNull();
  });

  it('strips unknown keys so the API may add fields without breaking the app', () => {
    const parsed = provenanceSchema.parse(buildProvenanceDto({ curatedBy: 'someone' }));

    expect(parsed).not.toHaveProperty('curatedBy');
  });
});
