import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Weapon } from 'src/model/types/weapon.type';

const { mockFetchAllWeapons } = vi.hoisted(() => {
  return {
    mockFetchAllWeapons: vi.fn(),
  };
});

vi.mock('src/model/gateways/weapons.gateway', () => ({
  WeaponsGateway: () => ({
    fetchAllWeapons: mockFetchAllWeapons,
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
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockFetchAllWeapons.mockRejectedValue(new Error('Network Error'));

      const { loading, getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(loading.value).toBe(false);
    });

    test('Deverá manter weapons vazio quando a API falhar', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockFetchAllWeapons.mockRejectedValue(new Error('Network Error'));

      const { weapons, getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(weapons.value).toStrictEqual([]);
    });

    test('Deverá logar o erro no console quando a API falhar', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const mockError = new Error('Network Error');
      mockFetchAllWeapons.mockRejectedValue(mockError);

      const { getAllWeapons } = useWeapons();
      await getAllWeapons();

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });
  });
});
