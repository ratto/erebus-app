import BaseGateway from './base.gateway';

export interface DiceRollResult {
  results: number[];
  total: number;
}

export const DiceGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'dice/roll';

  const rollDice = async (diceType: string, count: number): Promise<DiceRollResult> => {
    const response = await api.post(domainUrl, { diceType, count });
    return response.data as DiceRollResult;
  };

  return {
    rollDice,
  };
};
