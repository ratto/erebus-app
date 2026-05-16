import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Skill } from 'src/model/types/skill.type';

const { mockFetchAllSkills } = vi.hoisted(() => {
  return {
    mockFetchAllSkills: vi.fn(),
  };
});

vi.mock('src/model/gateways/skills.gateway', () => ({
  SkillsGateway: () => ({
    fetchAllSkills: mockFetchAllSkills,
  }),
}));

import { useSkills } from 'src/composables/skills.composable';

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
];

describe('useSkills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('estado inicial', () => {
    test('Deverá inicializar loading como false', () => {
      const { loading } = useSkills();

      expect(loading.value).toBe(false);
    });

    test('Deverá inicializar skills como lista vazia', () => {
      const { skills } = useSkills();

      expect(skills.value).toStrictEqual([]);
    });
  });

  describe('getAllSkills', () => {
    test('Deverá popular skills com os dados retornados pela API', async () => {
      mockFetchAllSkills.mockResolvedValue(skillsFixture);

      const { skills, getAllSkills } = useSkills();
      await getAllSkills();

      expect(skills.value).toEqual(skillsFixture);
    });

    test('Deverá definir loading como true durante a busca e false ao concluir', async () => {
      let resolvePromise!: (value: Skill[]) => void;
      const deferred = new Promise<Skill[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetchAllSkills.mockReturnValue(deferred);

      const { loading, getAllSkills } = useSkills();

      const fetchPromise = getAllSkills();
      expect(loading.value).toBe(true);

      resolvePromise(skillsFixture);
      await fetchPromise;

      expect(loading.value).toBe(false);
    });

    test('Deverá definir loading como false após um erro na API', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockFetchAllSkills.mockRejectedValue(new Error('Network Error'));

      const { loading, getAllSkills } = useSkills();
      await getAllSkills();

      expect(loading.value).toBe(false);
    });

    test('Deverá manter skills vazio quando a API falhar', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockFetchAllSkills.mockRejectedValue(new Error('Network Error'));

      const { skills, getAllSkills } = useSkills();
      await getAllSkills();

      expect(skills.value).toStrictEqual([]);
    });

    test('Deverá logar o erro no console quando a API falhar', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const mockError = new Error('Network Error');
      mockFetchAllSkills.mockRejectedValue(mockError);

      const { getAllSkills } = useSkills();
      await getAllSkills();

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });
  });
});
