export type AttributeCode = 'FR' | 'DEX' | 'AGI' | 'CON' | 'INT' | 'WILL' | 'CAR' | 'PER';

export interface CharacterAttributes {
  FR: number;
  DEX: number;
  AGI: number;
  CON: number;
  INT: number;
  WILL: number;
  CAR: number;
  PER: number;
}

export interface CharacterEnhancement {
  id: number;
  nome: string;
  custo: number;
}

export interface CharacterSkill {
  id: number;
  nome: string;
  pontos: number;
}

export interface Character {
  name: string;
  age: number;
  level: number;
  attributes: CharacterAttributes;
  enhancements: CharacterEnhancement[];
  skills: CharacterSkill[];
}

export interface CharacterComputed {
  pv: number;
  iniciativa: number;
  skillBudget: number;
  skillBudgetUsed: number;
  attributeBudget: number;
  attributeBudgetUsed: number;
  enhancementBudget: number;
  enhancementBudgetUsed: number;
}

export interface CharacterValidationError {
  code:
    | 'ATTRIBUTE_BUDGET'
    | 'ATTRIBUTE_RANGE'
    | 'ENHANCEMENT_BUDGET'
    | 'NEGATIVE_ENHANCEMENT_LIMIT'
    | 'SKILL_BUDGET'
    | 'SKILL_POINTS_MIN'
    | 'SKILL_POINTS_MAX';
  message: string;
  skillId?: number;
}

export interface CharacterValidationResponse {
  valid: boolean;
  character?: Character;
  computed: CharacterComputed;
  errors: CharacterValidationError[];
}
