import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { ProtectiveEquipment, ProtectiveEquipmentResponse } from 'src/model/types/protective-equipment.type';

const { mockGetAll } = vi.hoisted(() => {
  return {
    mockGetAll: vi.fn(),
  };
});

vi.mock('src/model/gateways/protective-equipment.gateway', () => ({
  ProtectiveEquipmentGateway: () => ({
    getAll: mockGetAll,
  }),
}));

vi.mock('src/model/utils/message', () => ({
  erebusMessage: () => ({
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    danger: vi.fn(),
    continuous: vi.fn(() => ({ dismiss: vi.fn() })),
  }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

import { useProtectiveEquipment } from 'src/composables/protective-equipment.composable';

const chainmail: ProtectiveEquipment = {
  id: 1,
  name: 'Chainmail',
  cost: null,
  availability: null,
  weightKg: null,
  dexPenalty: 3,
  agiPenalty: 2,
  description: 'Interlocked metal rings.',
  source: 'TREVAS, 3rd ed.',
  protectiveIndex: [
    { damageType: 'KINETIC',   ipValue: 6 },
    { damageType: 'BALLISTIC', ipValue: 2 },
    { damageType: 'FIRE',      ipValue: 0 },
    { damageType: 'COLD',      ipValue: 0 },
    { damageType: 'GAS',       ipValue: 0 },
    { damageType: 'ACID',      ipValue: 0 },
    { damageType: 'VACUUM',    ipValue: 0 },
    { damageType: 'ELECTRIC',  ipValue: 0 },
  ],
};

const responseFixture: ProtectiveEquipmentResponse = {
  locale: 'en-US',
  protectiveEquipment: [chainmail],
};

describe('useProtectiveEquipment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('estado inicial', () => {
    test('Deverá inicializar loading como false', () => {
      const { loading } = useProtectiveEquipment();

      expect(loading.value).toBe(false);
    });

    test('Deverá inicializar protectiveEquipments como lista vazia', () => {
      const { protectiveEquipments } = useProtectiveEquipment();

      expect(protectiveEquipments.value).toStrictEqual([]);
    });

    test('Deverá inicializar locale como "en-US"', () => {
      const { locale } = useProtectiveEquipment();

      expect(locale.value).toBe('en-US');
    });
  });

  describe('fetchProtectiveEquipment', () => {
    test('Deverá popular protectiveEquipments com os dados retornados pelo gateway', async () => {
      mockGetAll.mockResolvedValue(responseFixture);

      const { protectiveEquipments, fetchProtectiveEquipment } = useProtectiveEquipment();
      await fetchProtectiveEquipment();

      expect(protectiveEquipments.value).toEqual([chainmail]);
    });

    test('Deverá atualizar locale com o valor retornado pela API', async () => {
      const ptResponse: ProtectiveEquipmentResponse = { ...responseFixture, locale: 'pt-BR' };
      mockGetAll.mockResolvedValue(ptResponse);

      const { locale, fetchProtectiveEquipment } = useProtectiveEquipment();
      await fetchProtectiveEquipment();

      expect(locale.value).toBe('pt-BR');
    });

    test('Deverá chamar getAll sem filtros quando nenhum filtro for passado', async () => {
      mockGetAll.mockResolvedValue(responseFixture);

      const { fetchProtectiveEquipment } = useProtectiveEquipment();
      await fetchProtectiveEquipment();

      expect(mockGetAll).toHaveBeenCalledWith(undefined);
    });

    test('Deverá repassar filtros corretamente ao gateway', async () => {
      mockGetAll.mockResolvedValue(responseFixture);

      const { fetchProtectiveEquipment } = useProtectiveEquipment();
      await fetchProtectiveEquipment({ equipment: 'chainmail', damageType: 'KINETIC', minDexPenalty: 2 });

      expect(mockGetAll).toHaveBeenCalledWith({
        equipment: 'chainmail',
        damageType: 'KINETIC',
        minDexPenalty: 2,
      });
    });

    test('Deverá limpar protectiveEquipments ao iniciar uma nova busca', async () => {
      mockGetAll.mockResolvedValue(responseFixture);

      const { protectiveEquipments, fetchProtectiveEquipment } = useProtectiveEquipment();
      await fetchProtectiveEquipment();
      expect(protectiveEquipments.value).toHaveLength(1);

      mockGetAll.mockResolvedValue({ locale: 'en-US', protectiveEquipment: [] });
      await fetchProtectiveEquipment();
      expect(protectiveEquipments.value).toStrictEqual([]);
    });

    test('Deverá definir loading como true durante a busca e false ao concluir', async () => {
      let resolvePromise!: (value: ProtectiveEquipmentResponse) => void;
      const deferred = new Promise<ProtectiveEquipmentResponse>((resolve) => {
        resolvePromise = resolve;
      });
      mockGetAll.mockReturnValue(deferred);

      const { loading, fetchProtectiveEquipment } = useProtectiveEquipment();

      const fetchPromise = fetchProtectiveEquipment();
      expect(loading.value).toBe(true);

      resolvePromise(responseFixture);
      await fetchPromise;

      expect(loading.value).toBe(false);
    });

    test('Deverá definir loading como false após um erro no gateway', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockGetAll.mockRejectedValue(new Error('Network Error'));

      const { loading, fetchProtectiveEquipment } = useProtectiveEquipment();
      await fetchProtectiveEquipment();

      expect(loading.value).toBe(false);
    });

    test('Deverá manter protectiveEquipments vazio quando o gateway falhar', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockGetAll.mockRejectedValue(new Error('Network Error'));

      const { protectiveEquipments, fetchProtectiveEquipment } = useProtectiveEquipment();
      await fetchProtectiveEquipment();

      expect(protectiveEquipments.value).toStrictEqual([]);
    });

    test('Deverá capturar erro do gateway sem lançar exceção', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockGetAll.mockRejectedValue(new Error('Network Error'));

      const { fetchProtectiveEquipment } = useProtectiveEquipment();

      await expect(fetchProtectiveEquipment()).resolves.toBeUndefined();
    });

    test('Deverá logar o erro no console quando o gateway falhar', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const mockError = new Error('Network Error');
      mockGetAll.mockRejectedValue(mockError);

      const { fetchProtectiveEquipment } = useProtectiveEquipment();
      await fetchProtectiveEquipment();

      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });
  });
});
