import { ref } from 'vue';
import { EnhancementsGateway } from 'src/model/gateways/enhancements.gateway';
import type { Enhancement } from 'src/model/types/enhancement.type';

export const useEnhancements = () => {
  const gateway = EnhancementsGateway();

  const loading = ref<boolean>(false);
  const enhancements = ref<Enhancement[]>([]);
  const total = ref<number>(0);
  const page = ref<number>(1);
  const limit = ref<number>(20);
  const tipoFilter = ref<'' | 'positivo' | 'negativo'>('');
  const search = ref<string>('');
  const error = ref<string | null>(null);

  const fetchEnhancements = async () => {
    loading.value = true;
    error.value = null;

    const params: Parameters<typeof gateway.list>[0] = {
      page: page.value,
      limit: limit.value,
      ...(tipoFilter.value && { tipo: tipoFilter.value }),
      ...(search.value && { search: search.value }),
    };

    await gateway
      .list(params)
      .then((res) => {
        enhancements.value = res.data;
        total.value = res.total;
        page.value = res.page;
        limit.value = res.limit;
      })
      .catch((err: unknown) => {
        console.error(err);
        error.value = 'Erro ao carregar aprimoramentos.';
      })
      .finally(() => {
        loading.value = false;
      });
  };

  return {
    // States
    enhancements,
    total,
    page,
    limit,
    tipoFilter,
    search,
    loading,
    error,

    // Actions
    fetchEnhancements,
  };
};
