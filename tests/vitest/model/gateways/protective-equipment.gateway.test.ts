import type { AxiosResponse } from 'axios';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { ProtectiveEquipmentResponse } from 'src/model/types/protective-equipment.type';

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

import { ProtectiveEquipmentGateway } from 'src/model/gateways/protective-equipment.gateway';

const protectiveEquipmentResponseFixture: ProtectiveEquipmentResponse = {
  locale: 'pt-BR',
  protectiveEquipment: [
    {
      id: 1,
      name: 'Colete de Kevlar',
      cost: '500',
      availability: 'Comum',
      weightKg: 3.5,
      dexPenalty: -1,
      agiPenalty: -1,
      description: 'Proteção balística leve.',
      source: 'Daemon 4ed',
      protectiveIndex: [
        { damageType: 'KINETIC', ipValue: 4 },
        { damageType: 'BALLISTIC', ipValue: 6 },
        { damageType: 'FIRE', ipValue: 0 },
        { damageType: 'COLD', ipValue: 0 },
        { damageType: 'GAS', ipValue: 0 },
        { damageType: 'ACID', ipValue: 0 },
        { damageType: 'VACUUM', ipValue: 0 },
        { damageType: 'ELECTRIC', ipValue: 0 },
      ],
    },
  ],
};

describe('ProtectiveEquipmentGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    test('Deverá buscar todos os equipamentos de proteção sem filtros', async () => {
      const mockResponse: Partial<AxiosResponse<ProtectiveEquipmentResponse>> = {
        data: protectiveEquipmentResponseFixture,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = ProtectiveEquipmentGateway();
      const actual = await gateway.getAll();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('protective-equipments', { params: {} });
      expect(actual).toEqual(protectiveEquipmentResponseFixture);
    });

    test('Deverá buscar equipamentos de proteção filtrados pelo nome do equipamento', async () => {
      const mockResponse: Partial<AxiosResponse<ProtectiveEquipmentResponse>> = {
        data: protectiveEquipmentResponseFixture,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = ProtectiveEquipmentGateway();
      const actual = await gateway.getAll({ equipment: 'Colete' });

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('protective-equipments', { params: { equipment: 'Colete' } });
      expect(actual).toEqual(protectiveEquipmentResponseFixture);
    });

    test('Deverá buscar equipamentos de proteção filtrados pelo tipo de dano', async () => {
      const mockResponse: Partial<AxiosResponse<ProtectiveEquipmentResponse>> = {
        data: protectiveEquipmentResponseFixture,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = ProtectiveEquipmentGateway();
      const actual = await gateway.getAll({ damageType: 'KINETIC' });

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('protective-equipments', { params: { damageType: 'KINETIC' } });
      expect(actual).toEqual(protectiveEquipmentResponseFixture);
    });

    test('Deverá buscar equipamentos de proteção filtrados pelas penalidades de DEX e AGI', async () => {
      const mockResponse: Partial<AxiosResponse<ProtectiveEquipmentResponse>> = {
        data: protectiveEquipmentResponseFixture,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = ProtectiveEquipmentGateway();
      const actual = await gateway.getAll({
        minDexPenalty: -2,
        maxDexPenalty: 0,
        minAgiPenalty: -3,
        maxAgiPenalty: 0,
      });

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('protective-equipments', {
        params: {
          minDexPenalty: -2,
          maxDexPenalty: 0,
          minAgiPenalty: -3,
          maxAgiPenalty: 0,
        },
      });
      expect(actual).toEqual(protectiveEquipmentResponseFixture);
    });

    test('Deverá propagar o erro quando a API falhar', async () => {
      const mockError = new Error('Network Error');

      vi.mocked(mockGet).mockRejectedValue(mockError);

      const gateway = ProtectiveEquipmentGateway();

      await expect(gateway.getAll()).rejects.toThrow('Network Error');
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('protective-equipments', { params: {} });
    });
  });
});
