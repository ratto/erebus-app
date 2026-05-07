import { computed, ref } from 'vue';
import type { CharacterAttributes, CharacterEnhancement, CharacterSkill } from 'src/model/types/character.type';
import { CharactersGateway } from 'src/model/gateways/characters.gateway';
import { useCharacterStore } from 'src/stores/character.store';

const ATTRIBUTE_BUDGET = 111;
const ENHANCEMENT_BUDGET = 6;
const SKILL_BUDGET_CAP = 500;
const SKILL_POINTS_MIN = 10;
const SKILL_POINTS_MAX = 50;

function buildInitialAttributes(): CharacterAttributes {
  return { FR: 10, DEX: 10, AGI: 10, CON: 10, INT: 10, WILL: 10, CAR: 10, PER: 10 };
}

export const useCharacterBuilder = () => {
  const gateway = CharactersGateway();
  const characterStore = useCharacterStore();

  // --- State ---
  const name = ref<string>('');
  const age = ref<number>(16);
  const level = ref<number>(1);
  const attributes = ref<CharacterAttributes>(buildInitialAttributes());
  const enhancements = ref<CharacterEnhancement[]>([]);
  const skills = ref<CharacterSkill[]>([]);

  // --- Attribute computeds ---
  const attributeBudget = computed(() => ATTRIBUTE_BUDGET);

  const attributeBudgetUsed = computed(
    () =>
      attributes.value.FR +
      attributes.value.DEX +
      attributes.value.AGI +
      attributes.value.CON +
      attributes.value.INT +
      attributes.value.WILL +
      attributes.value.CAR +
      attributes.value.PER,
  );

  const attributeBalance = computed(() => attributeBudget.value - attributeBudgetUsed.value);

  // --- Enhancement computeds ---
  const enhancementBudget = computed(() => ENHANCEMENT_BUDGET);

  const enhancementBudgetUsed = computed(() =>
    enhancements.value.reduce((sum, e) => sum + e.custo, 0),
  );

  const enhancementBalance = computed(() => enhancementBudget.value - enhancementBudgetUsed.value);

  // --- Skill computeds ---
  const skillBudget = computed(() =>
    Math.min(10 * age.value + 5 * attributes.value.INT, SKILL_BUDGET_CAP),
  );

  const skillBudgetUsed = computed(() => skills.value.reduce((sum, s) => sum + s.pontos, 0));

  const skillBalance = computed(() => skillBudget.value - skillBudgetUsed.value);

  const skillsWithinRange = computed(() =>
    skills.value.every((s) => s.pontos >= SKILL_POINTS_MIN && s.pontos <= SKILL_POINTS_MAX),
  );

  // --- Character derived computeds ---
  const pv = computed(() => Math.ceil((attributes.value.FR + attributes.value.CON) / 2) + level.value);

  const iniciativa = computed(() => attributes.value.AGI);

  // --- canSave ---
  const canSave = computed(
    () =>
      attributeBalance.value === 0 &&
      enhancementBalance.value === 0 &&
      skillBudgetUsed.value <= skillBudget.value &&
      skillsWithinRange.value,
  );

  // --- Actions ---
  async function submit(): Promise<boolean> {
    try {
      const payload = {
        name: name.value,
        age: age.value,
        level: level.value,
        attributes: { ...attributes.value },
        enhancements: [...enhancements.value],
        skills: [...skills.value],
      };

      const response = await gateway.validateCharacter(payload);

      if (response.valid && response.character) {
        characterStore.save(response.character, response.computed);
        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  function reset(): void {
    name.value = '';
    age.value = 16;
    level.value = 1;
    attributes.value = buildInitialAttributes();
    enhancements.value = [];
    skills.value = [];
  }

  return {
    // State
    name,
    age,
    level,
    attributes,
    enhancements,
    skills,

    // Computeds
    pv,
    iniciativa,
    attributeBudget,
    attributeBudgetUsed,
    attributeBalance,
    enhancementBudget,
    enhancementBudgetUsed,
    enhancementBalance,
    skillBudget,
    skillBudgetUsed,
    skillBalance,
    skillsWithinRange,
    canSave,

    // Actions
    submit,
    reset,
  };
};
