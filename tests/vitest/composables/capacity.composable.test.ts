import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { CapacityResult } from 'src/model/types/capacity.type';

const { mockCalculateY, mockCalculateK, mockCalculateDamageBonus } = vi.hoisted(() => {
  return {
    mockCalculateY: vi.fn(),
    mockCalculateK: vi.fn(),
    mockCalculateDamageBonus: vi.fn(),
  };
});

vi.mock('src/model/gateways/capacity.gateway', () => ({
  CapacityGateway: () => ({
    calculateY: mockCalculateY,
    calculateK: mockCalculateK,
    calculateDamageBonus: mockCalculateDamageBonus,
  }),
}));

import { useCapacity } from 'src/composables/capacity.composable';

const resultFixture: CapacityResult = { value: 39.37 };

describe('useCapacity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Estado inicial ─────────────────────────────────────────────────────────

  describe('estado inicial', () => {
    test('loading deve inicializar como false', () => {
      const { loading } = useCapacity();

      expect(loading.value).toBe(false);
    });

    test('result deve inicializar como null', () => {
      const { result } = useCapacity();

      expect(result.value).toBeNull();
    });

    test('error deve inicializar como null', () => {
      const { error } = useCapacity();

      expect(error.value).toBeNull();
    });
  });

  // ── calculateY ─────────────────────────────────────────────────────────────

  describe('calculateY', () => {
    test('deve chamar gateway.calculateY com os parâmetros corretos', async () => {
      mockCalculateY.mockResolvedValue(resultFixture);

      const { calculateY } = useCapacity();
      await calculateY(10, 12.4);

      expect(mockCalculateY).toHaveBeenCalledWith({ attribute: 10, k: 12.4 });
    });

    test('deve atualizar result com o valor retornado pelo gateway', async () => {
      mockCalculateY.mockResolvedValue(resultFixture);

      const { result, calculateY } = useCapacity();
      await calculateY(10, 12.4);

      expect(result.value).toEqual(resultFixture);
    });

    test('loading deve ser true durante a chamada e false após', async () => {
      let resolvePromise!: (value: CapacityResult) => void;
      const deferred = new Promise<CapacityResult>((resolve) => {
        resolvePromise = resolve;
      });
      mockCalculateY.mockReturnValue(deferred);

      const { loading, calculateY } = useCapacity();

      const fetchPromise = calculateY(10, 12.4);
      expect(loading.value).toBe(true);

      resolvePromise(resultFixture);
      await fetchPromise;

      expect(loading.value).toBe(false);
    });

    test('deve definir loading como false após erro', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockCalculateY.mockRejectedValue(new Error('Network Error'));

      const { loading, calculateY } = useCapacity();
      await calculateY(10, 12.4);

      expect(loading.value).toBe(false);
    });

    test('deve definir error quando a chamada falhar', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockCalculateY.mockRejectedValue(new Error('Network Error'));

      const { error, calculateY } = useCapacity();
      await calculateY(10, 12.4);

      expect(error.value).not.toBeNull();
    });

    test('não deve lançar exceção para o componente quando houver erro', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockCalculateY.mockRejectedValue(new Error('Network Error'));

      const { calculateY } = useCapacity();

      await expect(calculateY(10, 12.4)).resolves.toBeUndefined();
    });
  });

  // ── calculateK ─────────────────────────────────────────────────────────────

  describe('calculateK', () => {
    test('deve chamar gateway.calculateK com os parâmetros corretos', async () => {
      mockCalculateK.mockResolvedValue(resultFixture);

      const { calculateK } = useCapacity();
      await calculateK(10, 39.37);

      expect(mockCalculateK).toHaveBeenCalledWith({ attribute: 10, y: 39.37 });
    });

    test('deve atualizar result com o valor retornado pelo gateway', async () => {
      mockCalculateK.mockResolvedValue(resultFixture);

      const { result, calculateK } = useCapacity();
      await calculateK(10, 39.37);

      expect(result.value).toEqual(resultFixture);
    });

    test('loading deve ser true durante a chamada e false após', async () => {
      let resolvePromise!: (value: CapacityResult) => void;
      const deferred = new Promise<CapacityResult>((resolve) => {
        resolvePromise = resolve;
      });
      mockCalculateK.mockReturnValue(deferred);

      const { loading, calculateK } = useCapacity();

      const fetchPromise = calculateK(10, 39.37);
      expect(loading.value).toBe(true);

      resolvePromise(resultFixture);
      await fetchPromise;

      expect(loading.value).toBe(false);
    });

    test('deve definir loading como false após erro', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockCalculateK.mockRejectedValue(new Error('Network Error'));

      const { loading, calculateK } = useCapacity();
      await calculateK(10, 39.37);

      expect(loading.value).toBe(false);
    });

    test('não deve lançar exceção para o componente quando houver erro', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockCalculateK.mockRejectedValue(new Error('Network Error'));

      const { calculateK } = useCapacity();

      await expect(calculateK(10, 39.37)).resolves.toBeUndefined();
    });
  });

  // ── calculateDamageBonus ───────────────────────────────────────────────────

  describe('calculateDamageBonus', () => {
    test('deve chamar gateway.calculateDamageBonus com os parâmetros corretos', async () => {
      mockCalculateDamageBonus.mockResolvedValue(resultFixture);

      const { calculateDamageBonus } = useCapacity();
      await calculateDamageBonus(16);

      expect(mockCalculateDamageBonus).toHaveBeenCalledWith({ fr: 16 });
    });

    test('deve atualizar result com o valor retornado pelo gateway', async () => {
      mockCalculateDamageBonus.mockResolvedValue(resultFixture);

      const { result, calculateDamageBonus } = useCapacity();
      await calculateDamageBonus(16);

      expect(result.value).toEqual(resultFixture);
    });

    test('loading deve ser true durante a chamada e false após', async () => {
      let resolvePromise!: (value: CapacityResult) => void;
      const deferred = new Promise<CapacityResult>((resolve) => {
        resolvePromise = resolve;
      });
      mockCalculateDamageBonus.mockReturnValue(deferred);

      const { loading, calculateDamageBonus } = useCapacity();

      const fetchPromise = calculateDamageBonus(16);
      expect(loading.value).toBe(true);

      resolvePromise(resultFixture);
      await fetchPromise;

      expect(loading.value).toBe(false);
    });

    test('deve definir loading como false após erro', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockCalculateDamageBonus.mockRejectedValue(new Error('Network Error'));

      const { loading, calculateDamageBonus } = useCapacity();
      await calculateDamageBonus(16);

      expect(loading.value).toBe(false);
    });

    test('não deve lançar exceção para o componente quando houver erro', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockCalculateDamageBonus.mockRejectedValue(new Error('Network Error'));

      const { calculateDamageBonus } = useCapacity();

      await expect(calculateDamageBonus(16)).resolves.toBeUndefined();
    });
  });
});
