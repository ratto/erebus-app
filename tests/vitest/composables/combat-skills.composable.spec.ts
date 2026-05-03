import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { CombatSkill } from 'src/model/types/combat-skill.type';

const { mockFetchAllCombatSkills } = vi.hoisted(() => {
  return {
    mockFetchAllCombatSkills: vi.fn(),
  };
});

vi.mock('src/model/gateways/combat-skills.gateway', () => ({
  CombatSkillsGateway: () => ({
    fetchAllCombatSkills: mockFetchAllCombatSkills,
  }),
}));

import { useCombatSkills } from 'src/composables/combat-skills.composable';

const combatSkillsFixture: CombatSkill[] = [
  {
    id: 1,
    nome: 'Espada',
    tipo: 'melee',
    atributoAtaque: 'DEX',
    atributoDefesa: 'DEX',
    aprimoramentoRequerido: null,
    descricao: 'Uso de espadas em combate.',
  },
  {
    id: 2,
    nome: 'Pistolas',
    tipo: 'ranged',
    atributoAtaque: 'DEX',
    atributoDefesa: null,
    aprimoramentoRequerido: 'Armas de Fogo',
    descricao: 'Uso de pistolas em combate à distância.',
  },
  {
    id: 3,
    nome: 'Escudo',
    tipo: 'shield',
    atributoAtaque: null,
    atributoDefesa: 'DEX',
    aprimoramentoRequerido: null,
    descricao: 'Uso de escudos para defesa.',
  },
];

describe('useCombatSkills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('estado inicial', () => {
    test('Deverá inicializar loading como false', () => {
      const { loading } = useCombatSkills();

      expect(loading.value).toBe(false);
    });

    test('Deverá inicializar combatSkills como lista vazia', () => {
      const { combatSkills } = useCombatSkills();

      expect(combatSkills.value).toStrictEqual([]);
    });
  });

  describe('getAllCombatSkills', () => {
    test('Deverá popular combatSkills com os dados retornados pelo gateway', async () => {
      mockFetchAllCombatSkills.mockResolvedValue(combatSkillsFixture);

      const { combatSkills, getAllCombatSkills } = useCombatSkills();
      await getAllCombatSkills();

      expect(combatSkills.value).toEqual(combatSkillsFixture);
    });

    test('Deverá chamar fetchAllCombatSkills exatamente uma vez', async () => {
      mockFetchAllCombatSkills.mockResolvedValue(combatSkillsFixture);

      const { getAllCombatSkills } = useCombatSkills();
      await getAllCombatSkills();

      expect(mockFetchAllCombatSkills).toHaveBeenCalledTimes(1);
    });

    test('Deverá limpar combatSkills ao iniciar uma nova busca', async () => {
      mockFetchAllCombatSkills.mockResolvedValue(combatSkillsFixture);

      const { combatSkills, getAllCombatSkills } = useCombatSkills();
      await getAllCombatSkills();

      expect(combatSkills.value).toEqual(combatSkillsFixture);

      mockFetchAllCombatSkills.mockResolvedValue([]);
      await getAllCombatSkills();

      expect(combatSkills.value).toStrictEqual([]);
    });

    test('Deverá definir loading como true durante a busca e false ao concluir', async () => {
      let resolvePromise!: (value: CombatSkill[]) => void;
      const deferred = new Promise<CombatSkill[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetchAllCombatSkills.mockReturnValue(deferred);

      const { loading, getAllCombatSkills } = useCombatSkills();

      const fetchPromise = getAllCombatSkills();
      expect(loading.value).toBe(true);

      resolvePromise(combatSkillsFixture);
      await fetchPromise;

      expect(loading.value).toBe(false);
    });

    test('Deverá definir loading como false após um erro na API', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockFetchAllCombatSkills.mockRejectedValue(new Error('Network Error'));

      const { loading, getAllCombatSkills } = useCombatSkills();
      await getAllCombatSkills();

      expect(loading.value).toBe(false);
    });

    test('Deverá manter combatSkills vazio quando o gateway falhar', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockFetchAllCombatSkills.mockRejectedValue(new Error('Network Error'));

      const { combatSkills, getAllCombatSkills } = useCombatSkills();
      await getAllCombatSkills();

      expect(combatSkills.value).toStrictEqual([]);
    });

    test('Deverá logar o erro no console quando o gateway falhar', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const mockError = new Error('Network Error');
      mockFetchAllCombatSkills.mockRejectedValue(mockError);

      const { getAllCombatSkills } = useCombatSkills();
      await getAllCombatSkills();

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });
  });
});
