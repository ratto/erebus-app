import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import type { Character, CharacterComputed } from 'src/model/types/character.type';

export const useCharacterStore = defineStore('character', () => {
  const current = ref<Character | null>(null);
  const computedValues = ref<CharacterComputed | null>(null);

  function save(character: Character, computed: CharacterComputed): void {
    current.value = character;
    computedValues.value = computed;
  }

  function clear(): void {
    current.value = null;
    computedValues.value = null;
  }

  return {
    current,
    computedValues,
    save,
    clear,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCharacterStore, import.meta.hot));
}
