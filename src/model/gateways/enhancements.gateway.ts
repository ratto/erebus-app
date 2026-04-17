import type { EnhancementsResponse } from '../types/enhancement.type';
import BaseGateway from './base.gateway';

export const EnhancementsGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'enhancements';

  const list = async (params: {
    page?: number;
    limit?: number;
    tipo?: 'positivo' | 'negativo' | '';
    search?: string;
  }): Promise<EnhancementsResponse> => {
    const query: Record<string, string | number> = {};
    if (params.page !== undefined) query['page'] = params.page;
    if (params.limit !== undefined) query['limit'] = params.limit;
    if (params.tipo) query['tipo'] = params.tipo;
    if (params.search) query['search'] = params.search;

    return (await api.get<EnhancementsResponse>(domainUrl, { params: query })).data;
  };

  return { list };
};
