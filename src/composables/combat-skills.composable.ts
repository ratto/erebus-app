import { ref } from 'vue';
import { CombatSkillsGateway } from 'src/model/gateways/combat-skills.gateway';
import type { CombatSkill } from 'src/model/types/combat-skill.type';
import { useI18n } from 'vue-i18n';
import { erebusMessage } from 'src/model/utils/message';

export const useCombatSkills = () => {
  const gateway = CombatSkillsGateway();
  const { t } = useI18n();
  const notify = erebusMessage();

  const loading = ref<boolean>(false);
  const combatSkills = ref<CombatSkill[]>([]);

  const getAllCombatSkills = async () => {
    loading.value = true;
    combatSkills.value = [];

    // Exibe notificação contínua enquanto carrega; dismiss é chamado no finally
    const { dismiss } = notify.continuous(t('common.loading.fetchingCombatSkills'));

    await gateway
      .fetchAllCombatSkills()
      .then((res) => {
        combatSkills.value.push(...res);
        notify.success(t('common.success.combatSkillsLoaded'));
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
    combatSkills,

    // Actions
    getAllCombatSkills,
  };
};
