import type { Enhancement } from '../types/enhancement.type';
import BaseGateway from './base.gateway';

export const EnhancementsGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'enhancements';

  const getAllEnhancements = async (): Promise<Array<Enhancement>> => {
    const response = await api.get<Array<Enhancement>>(domainUrl);

    return response.data;
  };

  return {
    getAllEnhancements,
  };
};
