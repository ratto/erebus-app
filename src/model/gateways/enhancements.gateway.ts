import type { Enhancement } from '../types/enhancement.type';
import BaseGateway from './base.gateway';

export const EnhancementsGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'enhancements';

  const getAllEnhancements = async (): Promise<Array<Enhancement>> => {
    const response = await api.get<{ enhancements: Array<Enhancement> }>(domainUrl);

    console.log(response);

    return response.data.enhancements;
  };

  return {
    getAllEnhancements,
  };
};
