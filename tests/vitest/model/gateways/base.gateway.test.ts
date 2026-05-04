import type { AxiosResponse } from 'axios';
import { vi, describe, test, expect, beforeEach } from 'vitest';

const { mockAxiosGet, mockAxiosPost } = vi.hoisted(() => {
  return {
    mockAxiosGet: vi.fn(),
    mockAxiosPost: vi.fn(),
  };
});

vi.mock('src/boot/axios', () => ({
  api: {
    get: mockAxiosGet,
    post: mockAxiosPost,
  },
}));

import BaseGateway from 'src/model/gateways/base.gateway';

describe('BaseGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api/v1');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('get', () => {
    test('Deverá construir a URL corretamente com baseUrl + domainUrl', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockAxiosGet).mockResolvedValue(mockResponse);

      const gateway = BaseGateway();
      await gateway.get('skills');

      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledWith('http://localhost:3000/api/v1/skills', undefined);
    });

    test('Deverá passar opções de requisição quando fornecidas', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: [],
        status: 200,
        statusText: 'OK',
      };

      const options = { timeout: 5000 };
      vi.mocked(mockAxiosGet).mockResolvedValue(mockResponse);

      const gateway = BaseGateway();
      await gateway.get('weapons', options);

      expect(mockAxiosGet).toHaveBeenCalledWith('http://localhost:3000/api/v1/weapons', options);
    });

    test('Deverá retornar a resposta do axios.get', async () => {
      const mockData = { nome: 'Espada', dano: '1d10' };
      const mockResponse: Partial<AxiosResponse> = {
        data: mockData,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockAxiosGet).mockResolvedValue(mockResponse);

      const gateway = BaseGateway();
      const actual = await gateway.get('weapons');

      expect(actual).toEqual(mockResponse);
    });

    test('Deverá propagar erro quando axios.get falha', async () => {
      const mockError = new Error('Network Error');
      vi.mocked(mockAxiosGet).mockRejectedValue(mockError);

      const gateway = BaseGateway();

      await expect(gateway.get('skills')).rejects.toThrow('Network Error');
    });
  });

  describe('post', () => {
    test('Deverá construir a URL corretamente com baseUrl + domainUrl', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: { success: true },
        status: 201,
        statusText: 'Created',
      };

      vi.mocked(mockAxiosPost).mockResolvedValue(mockResponse);

      const gateway = BaseGateway();
      await gateway.post('dice/roll', { diceType: 'd100', count: 1 });

      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/dice/roll',
        { diceType: 'd100', count: 1 },
        undefined,
      );
    });

    test('Deverá passar dados na requisição POST', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: { results: [50], total: 50 },
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockAxiosPost).mockResolvedValue(mockResponse);

      const gateway = BaseGateway();
      const payload = { diceType: 'd20', count: 2 };
      await gateway.post('dice/roll', payload);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/dice/roll',
        payload,
        undefined,
      );
    });

    test('Deverá passar opções de requisição quando fornecidas', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: { success: true },
        status: 201,
        statusText: 'Created',
      };

      const options = { timeout: 10000 };
      vi.mocked(mockAxiosPost).mockResolvedValue(mockResponse);

      const gateway = BaseGateway();
      await gateway.post('dice/roll', { diceType: 'd6', count: 1 }, options);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/dice/roll',
        { diceType: 'd6', count: 1 },
        options,
      );
    });

    test('Deverá retornar a resposta do axios.post', async () => {
      const mockData = { results: [4, 2], total: 6 };
      const mockResponse: Partial<AxiosResponse> = {
        data: mockData,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockAxiosPost).mockResolvedValue(mockResponse);

      const gateway = BaseGateway();
      const actual = await gateway.post('dice/roll', { diceType: 'd6', count: 2 });

      expect(actual).toEqual(mockResponse);
    });

    test('Deverá propagar erro quando axios.post falha', async () => {
      const mockError = new Error('Server Error');
      vi.mocked(mockAxiosPost).mockRejectedValue(mockError);

      const gateway = BaseGateway();

      await expect(gateway.post('dice/roll', { diceType: 'd100', count: 1 })).rejects.toThrow(
        'Server Error',
      );
    });
  });
});
