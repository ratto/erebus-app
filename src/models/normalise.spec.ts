import { describe, expect, it } from 'vitest';
import { normalise } from './normalise';

describe('normalise', () => {
  it('strips diacritics so "pericia" matches "Perícia"', () => {
    expect(normalise('Perícia')).toBe('pericia');
  });

  it('lowercases', () => {
    expect(normalise('CONDUÇÃO')).toBe('conducao');
  });

  it('trims surrounding whitespace', () => {
    expect(normalise('  Ônibus  ')).toBe('onibus');
  });

  it('leaves an already normalised value untouched', () => {
    expect(normalise('esquiva')).toBe('esquiva');
  });

  it('returns an empty string for an empty input', () => {
    expect(normalise('')).toBe('');
  });
});
