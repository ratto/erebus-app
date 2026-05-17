import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Enhancement } from 'src/model/types/enhancement.type';

const { mockGetAllEnhancements } = vi.hoisted(() => {
  return {
    mockGetAllEnhancements: vi.fn(),
  };
});

// Spies para verificar chamadas às notificações
const { mockSuccess, mockDanger, mockContinuous, mockDismiss } = vi.hoisted(() => ({
  mockSuccess: vi.fn(),
  mockDanger: vi.fn(),
  mockContinuous: vi.fn(),
  mockDismiss: vi.fn(),
}));

vi.mock('src/model/gateways/enhancements.gateway', () => ({
  EnhancementsGateway: () => ({
    getAllEnhancements: mockGetAllEnhancements,
  }),
}));

vi.mock('src/model/utils/message', () => ({
  erebusMessage: () => ({
    success: mockSuccess,
    info: vi.fn(),
    warning: vi.fn(),
    danger: mockDanger,
    continuous: mockContinuous.mockReturnValue({ dismiss: mockDismiss }),
  }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

import { useEnhancements } from 'src/composables/enhancements.composable';

const enhancementsFixture: Enhancement[] = [
  {
    id: 1,
    nome: 'Foco',
    tipo: 'positivo',
    custo: 10,
    descricao: 'Aumenta concentração',
  },
  {
    id: 2,
    nome: 'Resistência',
    tipo: 'negativo',
    custo: -5,
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
      mockGetAllEnhancements.mockRejectedValue(new Error('Network Error'));

      const { loading, fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(loading.value).toBe(false);
    });

    test('Deverá manter enhancements vazio quando a API falhar', async () => {
      mockGetAllEnhancements.mockRejectedValue(new Error('Network Error'));

      const { enhancements, fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(enhancements.value).toStrictEqual([]);
    });

    // ── Cenários de notificação (SPEC-051) ────────────────────────────────────

    test('Deverá chamar notify.continuous com a chave de loading ao iniciar a busca', async () => {
      mockGetAllEnhancements.mockResolvedValue(enhancementsFixture);

      const { fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(mockContinuous).toHaveBeenCalledWith('common.loading.fetchingEnhancements');
    });

    test('Deverá chamar notify.success com a chave de sucesso após carregar com êxito', async () => {
      mockGetAllEnhancements.mockResolvedValue(enhancementsFixture);

      const { fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(mockSuccess).toHaveBeenCalledWith('common.success.enhancementsLoaded');
    });

    test('Deverá chamar notify.danger com err.message quando o gateway falhar', async () => {
      const mockError = new Error('Falha de conexão');
      mockGetAllEnhancements.mockRejectedValue(mockError);

      const { fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(mockDanger).toHaveBeenCalledWith('Falha de conexão');
    });

    test('Deverá chamar dismiss() no finally em caso de sucesso', async () => {
      mockGetAllEnhancements.mockResolvedValue(enhancementsFixture);

      const { fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(mockDismiss).toHaveBeenCalledOnce();
    });

    test('Deverá chamar dismiss() no finally em caso de erro', async () => {
      mockGetAllEnhancements.mockRejectedValue(new Error('Network Error'));

      const { fetchEnhancements } = useEnhancements();
      await fetchEnhancements();

      expect(mockDismiss).toHaveBeenCalledOnce();
    });
  });
});
