import type { Enhancement } from '../types/enhancement.type';
import BaseGateway from './base.gateway';

export const EnhancementsGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'enhancements';

  const getAllEnhancements = async (): Promise<Array<Enhancement>> => {
    return (await api.get<{ enhancements: Array<Enhancement> }>(domainUrl)).data.enhancements;
  };

  return {
    getAllEnhancements,
  };
};
