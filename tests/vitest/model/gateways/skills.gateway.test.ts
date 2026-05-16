import type { AxiosResponse } from 'axios';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Skill } from 'src/model/types/skill.type';

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

import { SkillsGateway } from 'src/model/gateways/skills.gateway';

const skillsFixture: Skill[] = [
  {
    id: 1,
    name: 'Acrobatics',
    group: 'Physical',
    atributoBase: 'AGI',
    apenasComTreinamento: false,
    synergy: null,
    description: 'Habilidade em realizar contorções e acrobacias.',
  },
  {
    id: 2,
    name: 'Stealth',
    group: 'Furtive',
    atributoBase: 'AGI',
    apenasComTreinamento: true,
    synergy: null,
    description: 'Mover-se sem ser detectado.',
  },
  {
    id: 3,
    name: 'Occultism',
    group: 'Magic',
    atributoBase: 'INT',
    apenasComTreinamento: true,
    synergy: null,
    description: 'Conhecimento de artes arcanas e rituais.',
  },
];

describe('SkillsGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAllSkills', () => {
    test('Deverá buscar todas as perícias da API', async () => {
      const mockResponse: Partial<AxiosResponse<Skill[]>> = {
        data: skillsFixture,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = SkillsGateway();
      const actual = await gateway.fetchAllSkills();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('skills');
      expect(actual).toEqual(skillsFixture);
    });

    test('Deverá retornar uma lista vazia quando a API não retornar perícias', async () => {
      const mockResponse: Partial<AxiosResponse<Skill[]>> = {
        data: [],
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = SkillsGateway();
      const actual = await gateway.fetchAllSkills();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('skills');
      expect(actual).toStrictEqual([]);
    });

    test('Deverá propagar o erro quando a API falhar', async () => {
      const mockError = new Error('Network Error');

      vi.mocked(mockGet).mockRejectedValue(mockError);

      const gateway = SkillsGateway();

      await expect(gateway.fetchAllSkills()).rejects.toThrow('Network Error');
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('skills');
    });
  });
});
