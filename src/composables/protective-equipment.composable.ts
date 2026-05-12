import { ref } from 'vue';
import { ProtectiveEquipmentGateway } from 'src/model/gateways/protective-equipment.gateway';
import type { ProtectiveEquipment, ProtectiveEquipmentFilters } from 'src/model/types/protective-equipment.type';
import { useI18n } from 'vue-i18n';
import { erebusMessage } from 'src/model/utils/message';

export const useProtectiveEquipment = () => {
  const gateway = ProtectiveEquipmentGateway();
  const { t } = useI18n();
  const notify = erebusMessage();

  const loading = ref<boolean>(false);
  const protectiveEquipments = ref<ProtectiveEquipment[]>([]);
  const locale = ref<string>('en-US');

  const fetchProtectiveEquipment = async (filters?: ProtectiveEquipmentFilters) => {
    loading.value = true;
    protectiveEquipments.value = [];

    await gateway
      .getAll(filters)
      .then((res) => {
        locale.value = res.locale;
        protectiveEquipments.value.push(...res.protectiveEquipment);
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
    loading,
    protectiveEquipments,
    locale,
    fetchProtectiveEquipment,
  };
};
