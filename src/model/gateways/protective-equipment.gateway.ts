import type { ProtectiveEquipmentFilters, ProtectiveEquipmentResponse } from '../types/protective-equipment.type';
import BaseGateway from './base.gateway';

export const ProtectiveEquipmentGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'protective-equipments';

  const getAll = async (filters?: ProtectiveEquipmentFilters): Promise<ProtectiveEquipmentResponse> => {
    const params: Record<string, string | number> = {};
    if (filters?.equipment)                       params['equipment']      = filters.equipment;
    if (filters?.damageType)                      params['damageType']     = filters.damageType;
    if (filters?.minDexPenalty !== undefined)     params['minDexPenalty']  = filters.minDexPenalty;
    if (filters?.maxDexPenalty !== undefined)     params['maxDexPenalty']  = filters.maxDexPenalty;
    if (filters?.minAgiPenalty !== undefined)     params['minAgiPenalty']  = filters.minAgiPenalty;
    if (filters?.maxAgiPenalty !== undefined)     params['maxAgiPenalty']  = filters.maxAgiPenalty;

    const response = await api.get<ProtectiveEquipmentResponse>(domainUrl, { params });
    return response.data;
  };

  return { getAll };
};
