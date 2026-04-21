import type { DamageType } from '../enums/damage-type.enum';

export type WeaponDamage = {
  dieRoll: string;
  type: DamageType;
};
