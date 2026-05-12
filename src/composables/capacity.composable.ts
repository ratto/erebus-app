import { ref } from 'vue';
import { CapacityGateway } from 'src/model/gateways/capacity.gateway';

export const useCapacity = () => {
  const gateway = CapacityGateway();

  const loading = ref<boolean>(false);
  const result = ref<number | null>(null);
  const error = ref<string | null>(null);

  async function calculateY(attribute: number, k: number): Promise<void> {
    loading.value = true;
    result.value = null;
    error.value = null;

    try {
      result.value = await gateway.calculateY({ attribute, k });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao calcular Y';
    } finally {
      loading.value = false;
    }
  }

  async function calculateK(attribute: number, y: number): Promise<void> {
    loading.value = true;
    result.value = null;
    error.value = null;

    try {
      result.value = await gateway.calculateK({ attribute, y });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao calcular K';
    } finally {
      loading.value = false;
    }
  }

  async function calculateDamageBonus(fr: number): Promise<void> {
    loading.value = true;
    result.value = null;
    error.value = null;

    try {
      result.value = await gateway.calculateDamageBonus({ fr });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao calcular Bônus de Dano';
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    result,
    error,
    calculateY,
    calculateK,
    calculateDamageBonus,
  };
};
