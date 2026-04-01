import type { Skill } from '../types/skill.type';
import BaseGateway from './base.gateway';

export const SkillsGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'skills';

  const fetchAllSkills = async (): Promise<Array<Skill>> => {
    return (await api.get<Array<Skill>>(domainUrl)).data;
  };

  return {
    fetchAllSkills,
  };
};
