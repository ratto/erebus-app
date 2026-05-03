import { SkillsGateway } from 'src/model/gateways/skills.gateway';
import type { Skill } from 'src/model/types/skill.type';
import { ref } from 'vue';

export const useSkills = () => {
  const gateway = SkillsGateway();

  const loading = ref<boolean>(false);
  const skills = ref<Skill[]>([]);

  const getAllSkills = async () => {
    loading.value = true;
    skills.value = [];

    await gateway
      .fetchAllSkills()
      .then((res) => {
        skills.value.push(...res);
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
    skills,

    // Actions
    getAllSkills,
  };
};
