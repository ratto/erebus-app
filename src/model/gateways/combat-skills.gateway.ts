import type { CombatSkill } from '../types/combat-skill.type';
import BaseGateway from './base.gateway';

export const CombatSkillsGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'combat-skills';

  const fetchAllCombatSkills = async (): Promise<Array<CombatSkill>> => {
    return (await api.get<Array<CombatSkill>>(domainUrl)).data;
  };

  return {
    fetchAllCombatSkills,
  };
};
