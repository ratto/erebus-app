export type ItemType = 'mundane' | 'consumable';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
}

export type ItemInput = Omit<Item, 'id'>;
