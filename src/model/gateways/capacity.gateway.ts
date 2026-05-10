import BaseGateway from './base.gateway';
import type { CapacityResult, CapacityYParams, CapacityKParams, DamageBonusParams } from 'src/model/types/capacity.type';

export const CapacityGateway = () => {
  const base = BaseGateway();

  async function calculateY(params: CapacityYParams): Promise<CapacityResult> {
    const response = await base.post('capacity/calculate-y', { attribute: params.attribute, k: params.k });
    return response.data as CapacityResult;
  }

  async function calculateK(params: CapacityKParams): Promise<CapacityResult> {
    const response = await base.post('capacity/calculate-k', { attribute: params.attribute, y: params.y });
    return response.data as CapacityResult;
  }

  async function calculateDamageBonus(params: DamageBonusParams): Promise<CapacityResult> {
    const response = await base.post('capacity/damage-bonus', { fr: params.fr });
    return response.data as CapacityResult;
  }

  return {
    calculateY,
    calculateK,
    calculateDamageBonus,
  };
};
