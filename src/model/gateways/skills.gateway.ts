import type { Skill } from '../types/skill.type';
import BaseGateway from './base.gateway';

export const SkillsGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'skills';

  const fetchAllSkills = async (): Promise<Array<Skill>> => {
    const response = await api.get<Array<Skill>>(domainUrl);

    return response.data;
  };

  return {
    fetchAllSkills,
  };
};
