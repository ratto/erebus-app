export type ProtectiveIndexEntry = {
  damageType: string; // 'KINETIC' | 'BALLISTIC' | 'FIRE' | 'COLD' | 'GAS' | 'ACID' | 'VACUUM' | 'ELECTRIC'
  ipValue: number;
};

export type ProtectiveEquipment = {
  id: number;
  name: string;
  cost: string | null;
  availability: string | null;
  weightKg: number | null;
  dexPenalty: number;
  agiPenalty: number;
  description: string;
  source: string;
  protectiveIndex: ProtectiveIndexEntry[]; // sempre 8 entries ordenadas por DamageType
};

export type ProtectiveEquipmentResponse = {
  locale: string;
  protectiveEquipment: ProtectiveEquipment[];
};

export type ProtectiveEquipmentFilters = {
  equipment?: string;
  damageType?: string;
  minDexPenalty?: number;
  maxDexPenalty?: number;
  minAgiPenalty?: number;
  maxAgiPenalty?: number;
};
