import { ref } from 'vue';
import { EnhancementsGateway } from 'src/model/gateways/enhancements.gateway';
import type { Enhancement } from 'src/model/types/enhancement.type';

export const useEnhancements = () => {
  const gateway = EnhancementsGateway();

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
