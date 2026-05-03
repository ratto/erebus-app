import type { Character, CharacterValidationResponse } from '../types/character.type';
import BaseGateway from './base.gateway';

export const CharactersGateway = () => {
  const api = BaseGateway();
  const domainUrl = 'characters/validate';

  const validateCharacter = async (payload: Character): Promise<CharacterValidationResponse> => {
    const response = await api.post(domainUrl, payload);

    return response.data as CharacterValidationResponse;
  };

  return {
    validateCharacter,
  };
};
