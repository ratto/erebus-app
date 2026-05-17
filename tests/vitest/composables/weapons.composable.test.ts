import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Weapon } from 'src/model/types/weapon.type';

const { mockFetchAllWeapons } = vi.hoisted(() => {
  return {
    mockFetchAllWeapons: vi.fn(),
  };
});

// Spies para verificar chamadas às notificações
const { mockSuccess, mockDanger, mockContinuous, mockDismiss } = vi.hoisted(() => ({
  mockSuccess: vi.fn(),
  mockDanger: vi.fn(),
  mockContinuous: vi.fn(),
  mockDismiss: vi.fn(),
}));

vi.mock('src/model/gateways/weapons.gateway', () => ({
  WeaponsGateway: () => ({
    fetchAllWeapons: mockFetchAllWeapons,
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

import { useWeapons } from 'src/composables/weapons.composable';

const weaponsFixture: Weapon[] = [
  {
    id: 1,
    nome: 'Espada Longa',
    categoria: 'Espadas',
    dano: '1d10',
    iniciativa: '-2',
    fonte: 'Daemon 4ed',
    tipo: 'branca',
    tipoDano: 'Corte',
    ocultabilidade: null,
    alcanceMedio: null,
    alcanceMax: null,
    calibre: null,
    alcanceEfetivo: null,
    rof: null,
    pente: null,
  },
  {
    id: 2,
    nome: 'Pistola 9mm',
    categoria: 'Pistolas',
    dano: '2d6',
    iniciativa: '0',
    fonte: 'Daemon 4ed',
    tipo: 'fogo',
    tipoDano: 'Perfura',
    ocultabilidade: 'Fácil',
    alcanceMedio: '30m',
    alcanceMax: '60m',
    calibre: '9mm',
    alcanceEfetivo: '20m',
    rof: '1',
    pente: '15',
  },
];

describe('useWeapons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('estado inicial', () => {
    test('Deverá inicializar loading como false', () => {
      const { loading } = useWeapons();

      expect(loading.value).toBe(false);
    });

    test('Deverá inicializar weapons como lista vazia', () => {
      const { weapons } = useWeapons();

      expect(weapons.value).toStrictEqual([]);
    });
  });

  describe('getAllWeapons', () => {
    test('Deverá popular weapons com os dados retornados pela API', async () => {
      mockFetchAllWeapons.mockResolvedValue(weaponsFixture);

      const { weapons, getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(weapons.value).toEqual(weaponsFixture);
    });

    test('Deverá chamar fetchAllWeapons sem parâmetro quando tipo não for fornecido', async () => {
      mockFetchAllWeapons.mockResolvedValue(weaponsFixture);

      const { getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(mockFetchAllWeapons).toHaveBeenCalledTimes(1);
      expect(mockFetchAllWeapons).toHaveBeenCalledWith(undefined);
    });

    test('Deverá chamar fetchAllWeapons com o tipo quando o parâmetro for fornecido', async () => {
      const brancaFixture = weaponsFixture.filter((w) => w.tipo === 'branca');
      mockFetchAllWeapons.mockResolvedValue(brancaFixture);

      const { weapons, getAllWeapons } = useWeapons();
      await getAllWeapons('branca');

      expect(mockFetchAllWeapons).toHaveBeenCalledTimes(1);
      expect(mockFetchAllWeapons).toHaveBeenCalledWith('branca');
      expect(weapons.value).toEqual(brancaFixture);
    });

    test('Deverá limpar weapons ao iniciar uma nova busca', async () => {
      mockFetchAllWeapons.mockResolvedValue(weaponsFixture);

      const { weapons, getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(weapons.value).toEqual(weaponsFixture);

      mockFetchAllWeapons.mockResolvedValue([]);
      await getAllWeapons();

      expect(weapons.value).toStrictEqual([]);
    });

    test('Deverá definir loading como true durante a busca e false ao concluir', async () => {
      let resolvePromise!: (value: Weapon[]) => void;
      const deferred = new Promise<Weapon[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetchAllWeapons.mockReturnValue(deferred);

      const { loading, getAllWeapons } = useWeapons();

      const fetchPromise = getAllWeapons();
      expect(loading.value).toBe(true);

      resolvePromise(weaponsFixture);
      await fetchPromise;

      expect(loading.value).toBe(false);
    });

    test('Deverá definir loading como false após um erro na API', async () => {
      mockFetchAllWeapons.mockRejectedValue(new Error('Network Error'));

      const { loading, getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(loading.value).toBe(false);
    });

    test('Deverá manter weapons vazio quando a API falhar', async () => {
      mockFetchAllWeapons.mockRejectedValue(new Error('Network Error'));

      const { weapons, getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(weapons.value).toStrictEqual([]);
    });

    // ── Cenários de notificação (SPEC-051) ────────────────────────────────────

    test('Deverá chamar notify.continuous com a chave de loading ao iniciar a busca', async () => {
      mockFetchAllWeapons.mockResolvedValue(weaponsFixture);

      const { getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(mockContinuous).toHaveBeenCalledWith('common.loading.fetchingWeapons');
    });

    test('Deverá chamar notify.success com a chave de sucesso após carregar com êxito', async () => {
      mockFetchAllWeapons.mockResolvedValue(weaponsFixture);

      const { getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(mockSuccess).toHaveBeenCalledWith('common.success.weaponsLoaded');
    });

    test('Deverá chamar notify.danger com err.message quando o gateway falhar', async () => {
      const mockError = new Error('Falha de conexão');
      mockFetchAllWeapons.mockRejectedValue(mockError);

      const { getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(mockDanger).toHaveBeenCalledWith('Falha de conexão');
    });

    test('Deverá chamar dismiss() no finally em caso de sucesso', async () => {
      mockFetchAllWeapons.mockResolvedValue(weaponsFixture);

      const { getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(mockDismiss).toHaveBeenCalledOnce();
    });

    test('Deverá chamar dismiss() no finally em caso de erro', async () => {
      mockFetchAllWeapons.mockRejectedValue(new Error('Network Error'));

      const { getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(mockDismiss).toHaveBeenCalledOnce();
    });
  });
});
