import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Enhancement } from 'src/model/types/enhancement.type';

const { mockGetAllEnhancements } = vi.hoisted(() => {
  return {
    mockGetAllEnhancements: vi.fn(),
  };
});

vi.mock('src/model/gateways/enhancements.gateway', () => ({
  EnhancementsGateway: () => ({
    getAllEnhancements: mockGetAllEnhancements,
  }),
}));

import { useEnhancements } from 'src/composables/enhancements.composable';

const enhancementsFixture: Enhancement[] = [
  {
    id: 1,
    nome: 'Foco',
    tipo: 'Mental',
    descricao: 'Aumenta concentração',
  },
  {
    id: 2,
    nome: 'Resistência',
    tipo: 'Físico',
    descricao: 'Aumenta capacidade corporal',
  },
];

describe('useEnhancements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('estado inicial', () => {
    test('Deverá inicializar loading como false', () => {
      const { loading } = useEnhancements();

      expect(loading.value).toBe(false);
    });

    test('Deverá inicializar enhancements como lista vazia', () => {
      const { enhancements } = useEnhancements();

      expect(enhancements.value).toStrictEqual([]);
    });
  });

  describe('fetchEnhancements', () => {
    test('Deverá popular enhancements com os dados retornados pela API', async () => {
      mockGetAllEnhancements.mockResolvedValue(enhancementsFixture);

      const { enhancements, fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(enhancements.value).toEqual(enhancementsFixture);
    });

    test('Deverá definir loading como true durante a busca e false ao concluir', async () => {
      let resolvePromise!: (value: Enhancement[]) => void;
      const deferred = new Promise<Enhancement[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockGetAllEnhancements.mockReturnValue(deferred);

      const { loading, fetchEnhancements } = useEnhancements();

      const fetchPromise = fetchEnhancements();
      expect(loading.value).toBe(true);

      resolvePromise(enhancementsFixture);
      await fetchPromise;

      expect(loading.value).toBe(false);
    });

    test('Deverá definir loading como false após um erro na API', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockGetAllEnhancements.mockRejectedValue(new Error('Network Error'));

      const { loading, fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(loading.value).toBe(false);
    });

    test('Deverá manter enhancements vazio quando a API falhar', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockGetAllEnhancements.mockRejectedValue(new Error('Network Error'));

      const { enhancements, fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(enhancements.value).toStrictEqual([]);
    });

    test('Deverá logar o erro no console quando a API falhar', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const mockError = new Error('Network Error');
      mockGetAllEnhancements.mockRejectedValue(mockError);

      const { fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });
  });
});
