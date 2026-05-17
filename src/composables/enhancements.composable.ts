import { ref } from 'vue';
import { EnhancementsGateway } from 'src/model/gateways/enhancements.gateway';
import type { Enhancement } from 'src/model/types/enhancement.type';
import { useI18n } from 'vue-i18n';
import { erebusMessage } from 'src/model/utils/message';

export const useEnhancements = () => {
  const gateway = EnhancementsGateway();
  const { t } = useI18n();
  const notify = erebusMessage();

  const loading = ref<boolean>(false);
  const enhancements = ref<Enhancement[]>([]);

  const fetchEnhancements = async () => {
    loading.value = true;
    enhancements.value = [];

    // Exibe notificação contínua enquanto carrega; dismiss é chamado no finally
    const { dismiss } = notify.continuous(t('common.loading.fetchingEnhancements'));

    await gateway
      .getAllEnhancements()
      .then((res) => {
        enhancements.value.push(...res);
        notify.success(t('common.success.enhancementsLoaded'));
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
    enhancements,
    loading,

    // Actions
    fetchEnhancements,
  };
};
