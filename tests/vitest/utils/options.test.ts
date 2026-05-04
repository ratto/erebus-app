import { describe, it, expect } from 'vitest';
import { attributeOptions, type BaseOption } from 'src/utils/options';

describe('options.ts', () => {
  describe('attributeOptions', () => {
    it('Deverá exportar attributeOptions como array', () => {
      expect(Array.isArray(attributeOptions)).toBe(true);
    });

    it('Deverá conter exatamente 8 atributos do Sistema Daemon', () => {
      expect(attributeOptions).toHaveLength(8);
    });

    it('Deverá conter Constituição com code CON', () => {
      const found = attributeOptions.find((opt) => opt.value === 'CON');
      expect(found).toBeDefined();
      expect(found?.label).toBe('Constituição');
    });

    it('Deverá conter Força com code FR', () => {
      const found = attributeOptions.find((opt) => opt.value === 'FR');
      expect(found).toBeDefined();
      expect(found?.label).toBe('Força');
    });

    it('Deverá conter Destreza com code DEX', () => {
      const found = attributeOptions.find((opt) => opt.value === 'DEX');
      expect(found).toBeDefined();
      expect(found?.label).toBe('Destreza');
    });

    it('Deverá conter Agilidade com code AGI', () => {
      const found = attributeOptions.find((opt) => opt.value === 'AGI');
      expect(found).toBeDefined();
      expect(found?.label).toBe('Agilidade');
    });

    it('Deverá conter Inteligência com code INT', () => {
      const found = attributeOptions.find((opt) => opt.value === 'INT');
      expect(found).toBeDefined();
      expect(found?.label).toBe('Inteligência');
    });

    it('Deverá conter Força de Vontade com code WILL', () => {
      const found = attributeOptions.find((opt) => opt.value === 'WILL');
      expect(found).toBeDefined();
      expect(found?.label).toBe('Força de Vontade');
    });

    it('Deverá conter Percepção com code PER', () => {
      const found = attributeOptions.find((opt) => opt.value === 'PER');
      expect(found).toBeDefined();
      expect(found?.label).toBe('Percepção');
    });

    it('Deverá conter Carisma com code CAR', () => {
      const found = attributeOptions.find((opt) => opt.value === 'CAR');
      expect(found).toBeDefined();
      expect(found?.label).toBe('Carisma');
    });

    it('Todos os atributos devem ter label como string não-vazio', () => {
      attributeOptions.forEach((opt) => {
        expect(typeof opt.label).toBe('string');
        expect(opt.label.length).toBeGreaterThan(0);
      });
    });

    it('Todos os atributos devem ter value como string não-vazio', () => {
      attributeOptions.forEach((opt) => {
        expect(typeof opt.value).toBe('string');
        expect((opt.value as string).length).toBeGreaterThan(0);
      });
    });

    it('Nenhum atributo deve ter duplicatas de code', () => {
      const codes = attributeOptions.map((opt) => opt.value);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('Nenhum atributo deve ter duplicatas de label', () => {
      const labels = attributeOptions.map((opt) => opt.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });

    it('Deverá estar no formato BaseOption', () => {
      attributeOptions.forEach((opt) => {
        expect(opt).toHaveProperty('label');
        expect(opt).toHaveProperty('value');
      });
    });

    it('Valores dos códigos devem ser string de 2-4 caracteres', () => {
      attributeOptions.forEach((opt) => {
        expect(typeof opt.value).toBe('string');
        expect((opt.value as string).length).toBeGreaterThanOrEqual(2);
        expect((opt.value as string).length).toBeLessThanOrEqual(4);
      });
    });
  });
});
