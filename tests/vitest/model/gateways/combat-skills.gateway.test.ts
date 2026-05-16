import type { AxiosResponse } from 'axios';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { CombatSkill } from 'src/model/types/combat-skill.type';

const { mockGet } = vi.hoisted(() => {
  return {
    mockGet: vi.fn(),
  };
});

vi.mock('src/model/gateways/base.gateway', () => ({
  default: () => ({
    get: mockGet,
  }),
}));

import { CombatSkillsGateway } from 'src/model/gateways/combat-skills.gateway';

const combatSkillsFixture: CombatSkill[] = [
  {
    id: 1,
    nome: 'Espada',
    tipo: 'melee',
    atributoAtaque: 'FR',
    atributoDefesa: 'DEX',
    aprimoramentoRequerido: null,
    descricao: 'Perícia de combate com espadas.',
  },
  {
    id: 2,
    nome: 'Arco',
    tipo: 'ranged',
    atributoAtaque: 'DEX',
    atributoDefesa: null,
    aprimoramentoRequerido: null,
    descricao: 'Perícia de combate com arcos.',
  },
];

describe('CombatSkillsGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAllCombatSkills', () => {
    test('Deverá retornar a lista completa de perícias de combate', async () => {
      const mockResponse: Partial<AxiosResponse<CombatSkill[]>> = {
        data: combatSkillsFixture,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = CombatSkillsGateway();
      const actual = await gateway.fetchAllCombatSkills();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('combat-skills');
      expect(actual).toEqual(combatSkillsFixture);
    });

    test('Deverá retornar uma lista vazia quando a API não retornar perícias de combate', async () => {
      const mockResponse: Partial<AxiosResponse<CombatSkill[]>> = {
        data: [],
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = CombatSkillsGateway();
      const actual = await gateway.fetchAllCombatSkills();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('combat-skills');
      expect(actual).toStrictEqual([]);
    });

    test('Deverá propagar o erro quando a API falhar', async () => {
      const mockError = new Error('Network Error');

      vi.mocked(mockGet).mockRejectedValue(mockError);

      const gateway = CombatSkillsGateway();

      await expect(gateway.fetchAllCombatSkills()).rejects.toThrow('Network Error');
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('combat-skills');
    });
  });
});
