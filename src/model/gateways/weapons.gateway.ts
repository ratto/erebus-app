import type { Weapon } from '../types/weapon.type';
import BaseGateway from './base.gateway';

export const WeaponsGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'weapons';

  const fetchAllWeapons = async (tipo?: string): Promise<Array<Weapon>> => {
    const params = tipo ? { tipo } : {};

    const response = await api.get<{ weapons: Array<Weapon> }>(domainUrl, { params });

    return response.data.weapons;
  };

  return {
    fetchAllWeapons,
  };
};
