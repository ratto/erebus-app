import type { AxiosResponse } from 'axios';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { CapacityResult } from 'src/model/types/capacity.type';

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

import { CapacityGateway } from 'src/model/gateways/capacity.gateway';

const resultFixture: CapacityResult = { value: 39.37 };

describe('CapacityGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateY', () => {
    test('deve chamar post com o endpoint e payload corretos', async () => {
      const mockResponse: Partial<AxiosResponse<CapacityResult>> = {
        data: resultFixture,
        status: 200,
        statusText: 'OK',
      };
      mockPost.mockResolvedValue(mockResponse);

      const gateway = CapacityGateway();
      const actual = await gateway.calculateY({ attribute: 10, k: 12.4 });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith('capacity/calculate-y', { attribute: 10, k: 12.4 });
      expect(actual).toEqual(resultFixture);
    });

    test('deve propagar o erro quando a API falhar', async () => {
      const mockError = new Error('Network Error');
      mockPost.mockRejectedValue(mockError);

      const gateway = CapacityGateway();

      await expect(gateway.calculateY({ attribute: 10, k: 12.4 })).rejects.toThrow('Network Error');
    });
  });

  describe('calculateK', () => {
    test('deve chamar post com o endpoint e payload corretos', async () => {
      const mockResponse: Partial<AxiosResponse<CapacityResult>> = {
        data: resultFixture,
        status: 200,
        statusText: 'OK',
      };
      mockPost.mockResolvedValue(mockResponse);

      const gateway = CapacityGateway();
      const actual = await gateway.calculateK({ attribute: 10, y: 39.37 });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith('capacity/calculate-k', { attribute: 10, y: 39.37 });
      expect(actual).toEqual(resultFixture);
    });

    test('deve propagar o erro quando a API falhar', async () => {
      const mockError = new Error('Network Error');
      mockPost.mockRejectedValue(mockError);

      const gateway = CapacityGateway();

      await expect(gateway.calculateK({ attribute: 10, y: 39.37 })).rejects.toThrow('Network Error');
    });
  });

  describe('calculateDamageBonus', () => {
    test('deve chamar post com o endpoint e payload corretos', async () => {
      const mockResponse: Partial<AxiosResponse<CapacityResult>> = {
        data: { value: 1 },
        status: 200,
        statusText: 'OK',
      };
      mockPost.mockResolvedValue(mockResponse);

      const gateway = CapacityGateway();
      const actual = await gateway.calculateDamageBonus({ fr: 16 });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith('capacity/damage-bonus', { fr: 16 });
      expect(actual).toEqual({ value: 1 });
    });

    test('deve propagar o erro quando a API falhar', async () => {
      const mockError = new Error('Network Error');
      mockPost.mockRejectedValue(mockError);

      const gateway = CapacityGateway();

      await expect(gateway.calculateDamageBonus({ fr: 16 })).rejects.toThrow('Network Error');
    });
  });
});
