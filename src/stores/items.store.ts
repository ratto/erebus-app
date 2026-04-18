import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import { uid } from 'quasar';
import type { Item, ItemInput } from 'src/model/types/item.type';

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([]);

  function addItem(input: ItemInput): Item {
    const item: Item = { id: uid(), ...input };
    items.value.push(item);
    return item;
  }

  function updateItem(id: string, input: ItemInput): void {
    const idx = items.value.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items.value[idx] = { id, ...input };
    }
  }

  function removeItem(id: string): void {
    items.value = items.value.filter((i) => i.id !== id);
  }

  function getItemById(id: string): Item | undefined {
    return items.value.find((i) => i.id === id);
  }

  return { items, addItem, updateItem, removeItem, getItemById };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useItemsStore, import.meta.hot));
}
