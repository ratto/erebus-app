import { ref } from 'vue';
import { CombatSkillsGateway } from 'src/model/gateways/combat-skills.gateway';
import type { CombatSkill } from 'src/model/types/combat-skill.type';

export const useCombatSkills = () => {
  const gateway = CombatSkillsGateway();

  const loading = ref<boolean>(false);
  const combatSkills = ref<CombatSkill[]>([]);

  const getAllCombatSkills = async () => {
    loading.value = true;
    combatSkills.value = [];

    await gateway
      .fetchAllCombatSkills()
      .then((res) => {
        combatSkills.value.push(...res);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        loading.value = false;
      });
  };

  return {
    // States
    loading,
    combatSkills,

    // Actions
    getAllCombatSkills,
  };
};
