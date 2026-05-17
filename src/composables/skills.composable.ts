import { SkillsGateway } from 'src/model/gateways/skills.gateway';
import type { Skill } from 'src/model/types/skill.type';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { erebusMessage } from 'src/model/utils/message';

export const useSkills = () => {
  const gateway = SkillsGateway();
  const { t } = useI18n();
  // Instanciada no nível do setup para garantir contexto Vue válido (não dentro de callbacks async)
  const notify = erebusMessage();

  const loading = ref<boolean>(false);
  const skills = ref<Skill[]>([]);

  const getAllSkills = async () => {
    loading.value = true;
    skills.value = [];

    // Exibe notificação contínua enquanto carrega; dismiss é chamado no finally
    const { dismiss } = notify.continuous(t('common.loading.fetchingSkills'));

    await gateway
      .fetchAllSkills()
      .then((res) => {
        skills.value.push(...res);
        notify.success(t('common.success.skillsLoaded'));
      })
      .catch((err: Error) => {
        notify.danger(err.message);
      })
      .finally(() => {
        dismiss();
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
