import type { AxiosResponse } from 'axios';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Weapon } from 'src/model/types/weapon.type';

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

import { WeaponsGateway } from 'src/model/gateways/weapons.gateway';

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
    nome: 'Arco Curto',
    categoria: 'Arcos',
    dano: '1d6',
    iniciativa: '-1',
    fonte: 'Daemon 4ed',
    tipo: 'branca_distancia',
    tipoDano: 'Perfura',
    ocultabilidade: null,
    alcanceMedio: '30m',
    alcanceMax: '60m',
    calibre: null,
    alcanceEfetivo: null,
    rof: null,
    pente: null,
  },
  {
    id: 3,
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

describe('WeaponsGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAllWeapons', () => {
    test('Deverá buscar todas as armas da API sem filtro de tipo', async () => {
      const mockResponse: Partial<AxiosResponse<Weapon[]>> = {
        data: weaponsFixture,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = WeaponsGateway();
      const actual = await gateway.fetchAllWeapons();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('weapons', { params: {} });
      expect(actual).toEqual(weaponsFixture);
    });

    test.each(['branca', 'branca_distancia', 'fogo'])(
      'Deverá buscar armas filtradas pelo tipo da arma quando o parâmetro %j for fornecido',
      async (wepType) => {
        const weaponFixture = weaponsFixture.filter((w) => w.tipo === wepType);
        const mockResponse: Partial<AxiosResponse<Weapon[]>> = {
          data: weaponFixture,
          status: 200,
          statusText: 'OK',
        };

        vi.mocked(mockGet).mockResolvedValue(mockResponse);

        const gateway = WeaponsGateway();
        const actual = await gateway.fetchAllWeapons(wepType);

        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(mockGet).toHaveBeenCalledWith('weapons', { params: { tipo: wepType } });
        expect(actual).toEqual(weaponFixture);
      },
    );

    test('Deverá retornar uma lista vazia quando a API não retornar armas', async () => {
      const mockResponse: Partial<AxiosResponse<Weapon[]>> = {
        data: [],
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const gateway = WeaponsGateway();
      const actual = await gateway.fetchAllWeapons();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('weapons', { params: {} });
      expect(actual).toStrictEqual([]);
    });

    test('Deverá propagar o erro quando a API falhar', async () => {
      const mockError = new Error('Network Error');

      vi.mocked(mockGet).mockRejectedValue(mockError);

      const gateway = WeaponsGateway();

      await expect(gateway.fetchAllWeapons()).rejects.toThrow('Network Error');
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('weapons', { params: {} });
    });
  });
});
