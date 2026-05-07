import type { AxiosResponse } from 'axios';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { DiceRollResult } from 'src/model/gateways/dice.gateway';

const { mockPost } = vi.hoisted(() => {
  return {
    mockPost: vi.fn(),
  };
});

vi.mock('src/model/gateways/base.gateway', () => ({
  default: () => ({
    post: mockPost,
  }),
}));

import { DiceGateway } from 'src/model/gateways/dice.gateway';

describe('DiceGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rollDice', () => {
    test('Deverá chamar a API com os parâmetros diceType e count corretos', async () => {
      const mockResponse: Partial<AxiosResponse<DiceRollResult>> = {
        data: { results: [50], total: 50 },
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockPost).mockResolvedValue(mockResponse);

      const gateway = DiceGateway();
      await gateway.rollDice('d100', 1);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith('dice/roll', { diceType: 'd100', count: 1 });
    });

    test('Deverá retornar os dados de rollDice com results e total', async () => {
      const rollData = { results: [4, 2, 3], total: 9 };
      const mockResponse: Partial<AxiosResponse<DiceRollResult>> = {
        data: rollData,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockPost).mockResolvedValue(mockResponse);

      const gateway = DiceGateway();
      const actual = await gateway.rollDice('d6', 3);

      expect(actual).toEqual(rollData);
    });

    test('Deverá enviar diferentes tipos de dados corretamente', async () => {
      const mockResponse: Partial<AxiosResponse<DiceRollResult>> = {
        data: { results: [1], total: 1 },
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockPost).mockResolvedValue(mockResponse);

      const gateway = DiceGateway();
      await gateway.rollDice('d20', 2);

      expect(mockPost).toHaveBeenCalledWith('dice/roll', { diceType: 'd20', count: 2 });
    });

    test('Deverá propagar o erro quando a API falhar', async () => {
      const mockError = new Error('Network Error');

      vi.mocked(mockPost).mockRejectedValue(mockError);

      const gateway = DiceGateway();

      await expect(gateway.rollDice('d100', 1)).rejects.toThrow('Network Error');
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    test('Deverá retornar uma lista vazia de results quando a API não retornar dados', async () => {
      const mockResponse: Partial<AxiosResponse<DiceRollResult>> = {
        data: { results: [], total: 0 },
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockPost).mockResolvedValue(mockResponse);

      const gateway = DiceGateway();
      const actual = await gateway.rollDice('d6', 0);

      expect(actual.results).toStrictEqual([]);
      expect(actual.total).toBe(0);
    });
  });
});
