import { ref } from 'vue';
import { ProtectiveEquipmentGateway } from 'src/model/gateways/protective-equipment.gateway';
import type { ProtectiveEquipment, ProtectiveEquipmentFilters } from 'src/model/types/protective-equipment.type';

export const useProtectiveEquipment = () => {
  const gateway = ProtectiveEquipmentGateway();

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
