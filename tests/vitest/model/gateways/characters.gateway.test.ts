import type { AxiosResponse } from 'axios';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Character, CharacterValidationResponse } from 'src/model/types/character.type';

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

import { CharactersGateway } from 'src/model/gateways/characters.gateway';

const characterPayload: Character = {
  name: 'Aldric',
  age: 25,
  level: 1,
  attributes: {
    FR: 14,
    DEX: 13,
    AGI: 12,
    CON: 14,
    INT: 11,
    WILL: 13,
    CAR: 10,
    PER: 12,
  },
  enhancements: [{ id: 1, nome: 'Ambidestro', custo: 3 }],
  skills: [{ id: 5, nome: 'Espada', pontos: 2 }],
};

const computedFixture = {
  pv: 14,
  iniciativa: 12,
  skillBudget: 10,
  skillBudgetUsed: 2,
  attributeBudget: 111,
  attributeBudgetUsed: 99,
  enhancementBudget: 3,
  enhancementBudgetUsed: 3,
};

describe('CharactersGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateCharacter', () => {
    test('Deverá retornar resposta válida quando o personagem for válido', async () => {
      const responseBody: CharacterValidationResponse = {
        valid: true,
        character: characterPayload,
        computed: computedFixture,
        errors: [],
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: responseBody,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockPost).mockResolvedValue(mockResponse);

      const gateway = CharactersGateway();
      const actual = await gateway.validateCharacter(characterPayload);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith('characters/validate', characterPayload);
      expect(actual).toEqual(responseBody);
    });

    test('Deverá retornar resposta inválida com erros quando o personagem for inválido', async () => {
      const responseBody: CharacterValidationResponse = {
        valid: false,
        computed: computedFixture,
        errors: [{ code: 'ATTRIBUTE_BUDGET', message: 'Pontos de atributo excedem o limite.' }],
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: responseBody,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockPost).mockResolvedValue(mockResponse);

      const gateway = CharactersGateway();
      const actual = await gateway.validateCharacter(characterPayload);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith('characters/validate', characterPayload);
      expect(actual).toEqual(responseBody);
    });

    test('Deverá repassar integralmente o payload com listas vazias', async () => {
      const payloadWithEmptyLists: Character = {
        ...characterPayload,
        enhancements: [],
        skills: [],
      };

      const responseBody: CharacterValidationResponse = {
        valid: true,
        character: payloadWithEmptyLists,
        computed: computedFixture,
        errors: [],
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: responseBody,
        status: 200,
        statusText: 'OK',
      };

      vi.mocked(mockPost).mockResolvedValue(mockResponse);

      const gateway = CharactersGateway();
      const actual = await gateway.validateCharacter(payloadWithEmptyLists);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith('characters/validate', payloadWithEmptyLists);
      expect(actual).toEqual(responseBody);
    });

    test('Deverá propagar o erro quando a API falhar', async () => {
      const mockError = new Error('Network Error');

      vi.mocked(mockPost).mockRejectedValue(mockError);

      const gateway = CharactersGateway();

      await expect(gateway.validateCharacter(characterPayload)).rejects.toThrow('Network Error');
      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith('characters/validate', characterPayload);
    });
  });
});
