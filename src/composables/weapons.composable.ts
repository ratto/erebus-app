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

    // Exibe notificação contínua enquanto carrega; dismiss é chamado no finally
    const { dismiss } = notify.continuous(t('common.loading.fetchingWeapons'));

    await gateway
      .fetchAllWeapons(tipo)
      .then((res) => {
        weapons.value.push(...res);
        notify.success(t('common.success.weaponsLoaded'));
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
    weapons,

    // Actions
    getAllWeapons,
  };
};
