import { defineStore, acceptHMRUpdate } from 'pinia';
import { i18n, type MessageLanguages } from 'src/boot/i18n';

const STORAGE_KEY = 'erebus_locale';

export const useConfigStore = defineStore('config', {
  state: () => ({
    locale: (localStorage.getItem(STORAGE_KEY) as MessageLanguages) ?? 'pt-BR',
  }),
  actions: {
    setLocale(locale: MessageLanguages) {
      this.locale = locale;
      (i18n.global.locale as unknown as { value: string }).value = locale;
      localStorage.setItem(STORAGE_KEY, locale);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useConfigStore, import.meta.hot));
}
