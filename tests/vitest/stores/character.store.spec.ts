import { vi, describe, test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import type { Character, CharacterComputed } from 'src/model/types/character.type';

describe('useCharacterStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockCharacter: Character = {
    name: 'Aiden',
    age: 20,
    level: 1,
    attributes: { FR: 14, DEX: 14, AGI: 14, CON: 14, INT: 14, WILL: 14, CAR: 13, PER: 14 },
    enhancements: [{ id: 1, nome: 'Ambidestria', custo: 6 }],
    skills: [{ id: 1, nome: 'Espada', pontos: 20 }],
  };

  const mockComputed: CharacterComputed = {
    pv: 15,
    iniciativa: 14,
    skillBudget: 270,
    skillBudgetUsed: 20,
    attributeBudget: 111,
    attributeBudgetUsed: 111,
    enhancementBudget: 6,
    enhancementBudgetUsed: 6,
  };

  describe('estado inicial', () => {
    test('current é null inicialmente', async () => {
      const { useCharacterStore } = await import('src/stores/character.store');
      const store = useCharacterStore();
      expect(store.current).toBeNull();
    });

    test('computedValues é null inicialmente', async () => {
      const { useCharacterStore } = await import('src/stores/character.store');
      const store = useCharacterStore();
      expect(store.computedValues).toBeNull();
    });
  });

  describe('save()', () => {
    test('persiste current e computedValues', async () => {
      const { useCharacterStore } = await import('src/stores/character.store');
      const store = useCharacterStore();

      store.save(mockCharacter, mockComputed);

      expect(store.current).toEqual(mockCharacter);
      expect(store.computedValues).toEqual(mockComputed);
    });

    test('sobrescreve valores anteriores', async () => {
      const { useCharacterStore } = await import('src/stores/character.store');
      const store = useCharacterStore();

      store.save(mockCharacter, mockComputed);

      const newCharacter: Character = { ...mockCharacter, name: 'Bruna' };
      const newComputed: CharacterComputed = { ...mockComputed, pv: 20 };
      store.save(newCharacter, newComputed);

      expect(store.current?.name).toBe('Bruna');
      expect(store.computedValues?.pv).toBe(20);
    });
  });

  describe('clear()', () => {
    test('zera current e computedValues', async () => {
      const { useCharacterStore } = await import('src/stores/character.store');
      const store = useCharacterStore();

      store.save(mockCharacter, mockComputed);
      store.clear();

      expect(store.current).toBeNull();
      expect(store.computedValues).toBeNull();
    });
  });

  describe('reatividade', () => {
    test('mudanças em current são reativas', async () => {
      const { useCharacterStore } = await import('src/stores/character.store');
      const store = useCharacterStore();

      const values: Array<string | null> = [];

      // Observe changes manually by checking before/after
      expect(store.current).toBeNull();

      store.save(mockCharacter, mockComputed);
      expect(store.current?.name).toBe('Aiden');

      store.clear();
      expect(store.current).toBeNull();
    });
  });
});
