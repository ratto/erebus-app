import type { AxiosResponse } from 'axios';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Enhancement } from 'src/model/types/enhancement.type';

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

import { EnhancementsGateway } from 'src/model/gateways/enhancements.gateway';

const enhancementsFixture: Enhancement[] = [
  {
    id: 1,
    nome: 'Ambidestria',
    descricao: 'O personagem pode usar ambas as mãos com igual habilidade.',
    tipo: 'positivo',
    custo: 5,
  },
  {
    id: 2,
    nome: 'Mira Certeira',
    descricao: 'Aumenta a precisão em ataques à distância.',
    tipo: 'positivo',
    custo: 3,
  },
  {
    id: 3,
    nome: 'Fraqueza Mágica',
    descricao: 'O personagem sofre +50% de dano de magia.',
    tipo: 'negativo',
    custo: 0,
  },
];

describe('EnhancementsGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllEnhancements', () => {
    test('Deverá buscar todos os aprimoramentos da API', async () => {
      const mockResponse: Partial<AxiosResponse<Enhancement[]>> = {
        data: enhancementsFixture,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = EnhancementsGateway();
      const actual = await gateway.getAllEnhancements();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('enhancements');
      expect(actual).toEqual(enhancementsFixture);
    });

    test('Deverá retornar uma lista vazia quando a API não retornar aprimoramentos', async () => {
      const mockResponse: Partial<AxiosResponse<Enhancement[]>> = {
        data: [],
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = EnhancementsGateway();
      const actual = await gateway.getAllEnhancements();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('enhancements');
      expect(actual).toStrictEqual([]);
    });

    test('Deverá propagar o erro quando a API falhar', async () => {
      const mockError = new Error('Network Error');

      vi.mocked(mockGet).mockRejectedValue(mockError);

      const gateway = EnhancementsGateway();

      await expect(gateway.getAllEnhancements()).rejects.toThrow('Network Error');
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('enhancements');
    });
  });
});
