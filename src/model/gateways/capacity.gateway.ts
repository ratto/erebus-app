import BaseGateway from './base.gateway';
import type { CapacityYParams, CapacityKParams, DamageBonusParams } from 'src/model/types/capacity.type';

export const CapacityGateway = () => {
  const base = BaseGateway();

  async function calculateY(params: CapacityYParams): Promise<number> {
    const response = await base.post('capacity/calculate-y', { attribute: params.attribute, k: params.k });
    return response.data as number;
  }

  async function calculateK(params: CapacityKParams): Promise<number> {
    const response = await base.post('capacity/calculate-k', { attribute: params.attribute, y: params.y });
    return response.data as number;
  }

  async function calculateDamageBonus(params: DamageBonusParams): Promise<number> {
    const response = await base.post('capacity/damage-bonus', { fr: params.fr });
    return response.data as number;
  }

  return {
    calculateY,
    calculateK,
    calculateDamageBonus,
  };
};
