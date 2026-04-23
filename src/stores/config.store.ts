import { defineStore, acceptHMRUpdate } from 'pinia';
import { i18n, type MessageLanguages } from 'src/boot/i18n';

export type CampaignScenario = 'contemporary' | 'medieval' | 'futuristic';
export type GameType = 'action' | 'turn_based';

const STORAGE_KEY_LOCALE = 'erebus_locale';
const STORAGE_KEY_SCENARIO = 'erebus_campaign_scenario';
const STORAGE_KEY_GAME_TYPE = 'erebus_game_type';

export const useConfigStore = defineStore('config', {
  state: () => ({
    locale:
      (localStorage.getItem(STORAGE_KEY_LOCALE) as MessageLanguages) ?? 'pt-BR',
    campaignScenario:
      (localStorage.getItem(STORAGE_KEY_SCENARIO) as CampaignScenario) ??
      'contemporary',
    gameType:
      (localStorage.getItem(STORAGE_KEY_GAME_TYPE) as GameType) ?? 'action',
  }),
  actions: {
    setLocale(locale: MessageLanguages) {
      this.locale = locale;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const global = i18n.global as any;
      (global.locale as { value: string }).value = locale;
      localStorage.setItem(STORAGE_KEY_LOCALE, locale);
    },
    setCampaignScenario(scenario: CampaignScenario) {
      this.campaignScenario = scenario;
      localStorage.setItem(STORAGE_KEY_SCENARIO, scenario);
    },
    setGameType(type: GameType) {
      this.gameType = type;
      localStorage.setItem(STORAGE_KEY_GAME_TYPE, type);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useConfigStore, import.meta.hot));
}
