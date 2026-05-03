import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { CharacterValidationResponse } from 'src/model/types/character.type';

const { mockValidateCharacter } = vi.hoisted(() => ({
  mockValidateCharacter: vi.fn(),
}));

vi.mock('src/model/gateways/characters.gateway', () => ({
  CharactersGateway: () => ({
    validateCharacter: mockValidateCharacter,
  }),
}));

vi.mock('src/stores/character.store', () => ({
  useCharacterStore: () => ({
    save: vi.fn(),
    clear: vi.fn(),
  }),
}));

import { useCharacterBuilder } from 'src/composables/character.composable';

const validResponse: CharacterValidationResponse = {
  valid: true,
  character: {
    name: 'Aiden',
    age: 20,
    level: 1,
    attributes: { FR: 14, DEX: 14, AGI: 14, CON: 14, INT: 14, WILL: 14, CAR: 13, PER: 14 },
    enhancements: [{ id: 1, nome: 'Ambidestria', custo: 6 }],
    skills: [{ id: 1, nome: 'Espada', pontos: 20 }],
  },
  computed: {
    pv: 15,
    iniciativa: 14,
    skillBudget: 270,
    skillBudgetUsed: 20,
    attributeBudget: 111,
    attributeBudgetUsed: 111,
    enhancementBudget: 6,
    enhancementBudgetUsed: 6,
  },
  errors: [],
};

describe('useCharacterBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('estado inicial', () => {
    test('inicializa name como string vazia', () => {
      const { name } = useCharacterBuilder();
      expect(name.value).toBe('');
    });

    test('inicializa age como 16', () => {
      const { age } = useCharacterBuilder();
      expect(age.value).toBe(16);
    });

    test('inicializa level como 1', () => {
      const { level } = useCharacterBuilder();
      expect(level.value).toBe(1);
    });

    test('inicializa todos os atributos como 10', () => {
      const { attributes } = useCharacterBuilder();
      expect(attributes.value.FR).toBe(10);
      expect(attributes.value.DEX).toBe(10);
      expect(attributes.value.AGI).toBe(10);
      expect(attributes.value.CON).toBe(10);
      expect(attributes.value.INT).toBe(10);
      expect(attributes.value.WILL).toBe(10);
      expect(attributes.value.CAR).toBe(10);
      expect(attributes.value.PER).toBe(10);
    });
  });

  describe('computeds de atributos', () => {
    test('attributeBudget é sempre 111', () => {
      const { attributeBudget } = useCharacterBuilder();
      expect(attributeBudget.value).toBe(111);
    });

    test('attributeBudgetUsed é a soma dos 8 atributos', () => {
      const { attributes, attributeBudgetUsed } = useCharacterBuilder();
      // initial: 10 * 8 = 80
      expect(attributeBudgetUsed.value).toBe(80);

      attributes.value.FR = 14;
      expect(attributeBudgetUsed.value).toBe(84);
    });

    test('attributeBalance = attributeBudget - attributeBudgetUsed', () => {
      const { attributes, attributeBalance } = useCharacterBuilder();
      // initial: 111 - 80 = 31
      expect(attributeBalance.value).toBe(31);

      attributes.value.FR = 14;
      // 111 - 84 = 27
      expect(attributeBalance.value).toBe(27);
    });
  });

  describe('computeds de aprimoramentos', () => {
    test('enhancementBudget é sempre 6', () => {
      const { enhancementBudget } = useCharacterBuilder();
      expect(enhancementBudget.value).toBe(6);
    });

    test('enhancementBudgetUsed é a soma dos custos', () => {
      const { enhancements, enhancementBudgetUsed } = useCharacterBuilder();
      expect(enhancementBudgetUsed.value).toBe(0);

      enhancements.value = [
        { id: 1, nome: 'Ambidestria', custo: 3 },
        { id: 2, nome: 'Reflexos', custo: 2 },
      ];
      expect(enhancementBudgetUsed.value).toBe(5);
    });

    test('enhancementBalance = enhancementBudget - enhancementBudgetUsed', () => {
      const { enhancements, enhancementBalance } = useCharacterBuilder();
      expect(enhancementBalance.value).toBe(6);

      enhancements.value = [{ id: 1, nome: 'Ambidestria', custo: 4 }];
      expect(enhancementBalance.value).toBe(2);
    });
  });

  describe('computeds de perícias', () => {
    test('skillBudget = min(10*age + 5*INT, 500)', () => {
      const { age, attributes, skillBudget } = useCharacterBuilder();
      age.value = 20;
      attributes.value.INT = 14;
      // 10*20 + 5*14 = 270
      expect(skillBudget.value).toBe(270);
    });

    test('skillBudget é limitado a 500', () => {
      const { age, attributes, skillBudget } = useCharacterBuilder();
      age.value = 50;
      attributes.value.INT = 20;
      // 10*50 + 5*20 = 600 → 500
      expect(skillBudget.value).toBe(500);
    });

    test('skillBudgetUsed é a soma dos pontos', () => {
      const { skills, skillBudgetUsed } = useCharacterBuilder();
      expect(skillBudgetUsed.value).toBe(0);

      skills.value = [
        { id: 1, nome: 'Espada', pontos: 20 },
        { id: 2, nome: 'Corrida', pontos: 15 },
      ];
      expect(skillBudgetUsed.value).toBe(35);
    });

    test('skillBalance = skillBudget - skillBudgetUsed', () => {
      const { age, attributes, skills, skillBalance } = useCharacterBuilder();
      age.value = 20;
      attributes.value.INT = 14;
      skills.value = [{ id: 1, nome: 'Espada', pontos: 20 }];
      // 270 - 20 = 250
      expect(skillBalance.value).toBe(250);
    });
  });

  describe('iniciativa e pv', () => {
    test('iniciativa = AGI', () => {
      const { attributes, iniciativa } = useCharacterBuilder();
      attributes.value.AGI = 14;
      expect(iniciativa.value).toBe(14);
    });

    test('pv = ceil((FR + CON) / 2) + level', () => {
      const { attributes, level, pv } = useCharacterBuilder();
      attributes.value.FR = 14;
      attributes.value.CON = 14;
      level.value = 1;
      expect(pv.value).toBe(Math.ceil((14 + 14) / 2) + 1); // 15
    });
  });

  describe('canSave', () => {
    test('canSave é true com ficha válida', () => {
      const { name, age, level, attributes, enhancements, skills, canSave } = useCharacterBuilder();
      name.value = 'Aiden';
      age.value = 20;
      level.value = 1;
      attributes.value = { FR: 14, DEX: 14, AGI: 14, CON: 14, INT: 14, WILL: 14, CAR: 13, PER: 14 };
      enhancements.value = [{ id: 1, nome: 'Ambidestria', custo: 6 }];
      skills.value = [{ id: 1, nome: 'Espada', pontos: 20 }];

      expect(canSave.value).toBe(true);
    });

    test('canSave é false quando attributeBalance != 0', () => {
      const { attributes, canSave } = useCharacterBuilder();
      // default: 10*8=80, balance=31 != 0
      expect(canSave.value).toBe(false);

      // set sum=112 (not 111)
      attributes.value = { FR: 14, DEX: 14, AGI: 14, CON: 14, INT: 14, WILL: 14, CAR: 14, PER: 14 };
      expect(canSave.value).toBe(false);
    });

    test('canSave é false quando skillBudgetUsed excede skillBudget', () => {
      const { age, attributes, enhancements, skills, canSave } = useCharacterBuilder();
      attributes.value = { FR: 14, DEX: 14, AGI: 14, CON: 14, INT: 14, WILL: 14, CAR: 13, PER: 14 };
      enhancements.value = [{ id: 1, nome: 'Test', custo: 6 }];
      age.value = 6; // budget = min(60+70, 500) = 130
      // use 7*20 = 140 points
      skills.value = [
        { id: 1, nome: 'A', pontos: 20 },
        { id: 2, nome: 'B', pontos: 20 },
        { id: 3, nome: 'C', pontos: 20 },
        { id: 4, nome: 'D', pontos: 20 },
        { id: 5, nome: 'E', pontos: 20 },
        { id: 6, nome: 'F', pontos: 20 },
        { id: 7, nome: 'G', pontos: 20 },
      ];
      expect(canSave.value).toBe(false);
    });

    test('canSave é false quando uma perícia tem pontos < 10', () => {
      const { attributes, enhancements, skills, canSave } = useCharacterBuilder();
      attributes.value = { FR: 14, DEX: 14, AGI: 14, CON: 14, INT: 14, WILL: 14, CAR: 13, PER: 14 };
      enhancements.value = [{ id: 1, nome: 'Test', custo: 6 }];
      skills.value = [{ id: 1, nome: 'Espada', pontos: 9 }];

      expect(canSave.value).toBe(false);
    });

    test('canSave é false quando uma perícia tem pontos > 50', () => {
      const { attributes, enhancements, skills, canSave } = useCharacterBuilder();
      attributes.value = { FR: 14, DEX: 14, AGI: 14, CON: 14, INT: 14, WILL: 14, CAR: 13, PER: 14 };
      enhancements.value = [{ id: 1, nome: 'Test', custo: 6 }];
      skills.value = [{ id: 1, nome: 'Espada', pontos: 51 }];

      expect(canSave.value).toBe(false);
    });
  });

  describe('submit()', () => {
    test('retorna true e chama save quando API retorna valid=true', async () => {
      mockValidateCharacter.mockResolvedValue(validResponse);

      const { name, age, level, attributes, enhancements, skills, submit } = useCharacterBuilder();
      name.value = 'Aiden';
      age.value = 20;
      level.value = 1;
      attributes.value = { FR: 14, DEX: 14, AGI: 14, CON: 14, INT: 14, WILL: 14, CAR: 13, PER: 14 };
      enhancements.value = [{ id: 1, nome: 'Ambidestria', custo: 6 }];
      skills.value = [{ id: 1, nome: 'Espada', pontos: 20 }];

      const result = await submit();
      expect(result).toBe(true);
      expect(mockValidateCharacter).toHaveBeenCalledTimes(1);
    });

    test('retorna false quando API retorna valid=false', async () => {
      const invalidResponse: CharacterValidationResponse = {
        ...validResponse,
        valid: false,
        errors: [{ code: 'ATTRIBUTE_BUDGET', message: 'Soma incorreta' }],
      };
      mockValidateCharacter.mockResolvedValue(invalidResponse);

      const { submit } = useCharacterBuilder();
      const result = await submit();
      expect(result).toBe(false);
    });

    test('retorna false quando o gateway lança erro', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockValidateCharacter.mockRejectedValue(new Error('Network Error'));

      const { submit } = useCharacterBuilder();
      const result = await submit();
      expect(result).toBe(false);
    });
  });

  describe('reset()', () => {
    test('restaura o estado inicial após reset', () => {
      const { name, age, attributes, skills, enhancements, reset } = useCharacterBuilder();

      name.value = 'Aiden';
      age.value = 30;
      attributes.value.FR = 18;
      skills.value = [{ id: 1, nome: 'Espada', pontos: 20 }];
      enhancements.value = [{ id: 1, nome: 'Ambidestria', custo: 6 }];

      reset();

      expect(name.value).toBe('');
      expect(age.value).toBe(16);
      expect(attributes.value.FR).toBe(10);
      expect(skills.value).toHaveLength(0);
      expect(enhancements.value).toHaveLength(0);
    });
  });
});
