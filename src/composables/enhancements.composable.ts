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

    await gateway
      .getAllEnhancements()
      .then((res) => {
        enhancements.value.push(...res);
      })
      .catch((err) => {
        console.error(err);
        notify.danger(t('common.errors.fetchFailed'));
      })
      .finally(() => {
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
