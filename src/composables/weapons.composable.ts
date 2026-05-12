import { ref } from 'vue';
import { WeaponsGateway } from 'src/model/gateways/weapons.gateway';
import type { Weapon } from 'src/model/types/weapon.type';
import { useI18n } from 'vue-i18n';
import { erebusMessage } from 'src/model/utils/message';

export const useWeapons = () => {
  const gateway = WeaponsGateway();
  const { t } = useI18n();
  const notify = erebusMessage();

  const loading = ref<boolean>(false);
  const weapons = ref<Weapon[]>([]);

  const getAllWeapons = async (tipo?: string) => {
    loading.value = true;
    weapons.value = [];

    await gateway
      .fetchAllWeapons(tipo)
      .then((res) => {
        weapons.value.push(...res);
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
    loading,
    weapons,

    // Actions
    getAllWeapons,
  };
};
