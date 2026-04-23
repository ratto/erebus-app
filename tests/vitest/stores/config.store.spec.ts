import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// vi.hoisted garante que mockLocaleRef seja criado antes do hoisting do vi.mock
const { mockLocaleRef } = vi.hoisted(() => ({
  mockLocaleRef: { value: 'pt-BR' as string },
}));

// Mock i18n antes de importar a store
vi.mock('src/boot/i18n', () => ({
  i18n: {
    global: {
      locale: mockLocaleRef,
    },
  },
}));

import { useConfigStore } from 'src/stores/config.store';

const STORAGE_KEY_LOCALE = 'erebus_locale';
const STORAGE_KEY_SCENARIO = 'erebus_campaign_scenario';
const STORAGE_KEY_GAME_TYPE = 'erebus_game_type';

describe('config.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    mockLocaleRef.value = 'pt-BR';
  });

  afterEach(() => {
    localStorage.clear();
  });

  // --- locale (testes existentes) ---

  it('estado inicial sem localStorage: locale = pt-BR', () => {
    const store = useConfigStore();
    expect(store.locale).toBe('pt-BR');
  });

  it('estado inicial com localStorage salvo: lê en-US do storage', () => {
    localStorage.setItem(STORAGE_KEY_LOCALE, 'en-US');
    const store = useConfigStore();
    expect(store.locale).toBe('en-US');
  });

  it('setLocale atualiza store.locale', () => {
    const store = useConfigStore();
    store.setLocale('en-US');
    expect(store.locale).toBe('en-US');
  });

  it('setLocale persiste no localStorage', () => {
    const store = useConfigStore();
    store.setLocale('en-US');
    expect(localStorage.getItem(STORAGE_KEY_LOCALE)).toBe('en-US');
  });

  it('setLocale atualiza i18n.global.locale.value', () => {
    const store = useConfigStore();
    store.setLocale('en-US');
    expect(mockLocaleRef.value).toBe('en-US');
  });

  // --- campaignScenario ---

  it('estado inicial sem localStorage: campaignScenario = contemporary', () => {
    const store = useConfigStore();
    expect(store.campaignScenario).toBe('contemporary');
  });

  it('estado inicial com localStorage salvo: lê medieval do storage', () => {
    localStorage.setItem(STORAGE_KEY_SCENARIO, 'medieval');
    const store = useConfigStore();
    expect(store.campaignScenario).toBe('medieval');
  });

  it('setCampaignScenario atualiza store.campaignScenario', () => {
    const store = useConfigStore();
    store.setCampaignScenario('futuristic');
    expect(store.campaignScenario).toBe('futuristic');
  });

  it('setCampaignScenario persiste no localStorage', () => {
    const store = useConfigStore();
    store.setCampaignScenario('medieval');
    expect(localStorage.getItem(STORAGE_KEY_SCENARIO)).toBe('medieval');
  });

  // --- gameType ---

  it('estado inicial sem localStorage: gameType = action', () => {
    const store = useConfigStore();
    expect(store.gameType).toBe('action');
  });

  it('estado inicial com localStorage salvo: lê turn_based do storage', () => {
    localStorage.setItem(STORAGE_KEY_GAME_TYPE, 'turn_based');
    const store = useConfigStore();
    expect(store.gameType).toBe('turn_based');
  });

  it('setGameType atualiza store.gameType', () => {
    const store = useConfigStore();
    store.setGameType('turn_based');
    expect(store.gameType).toBe('turn_based');
  });

  it('setGameType persiste no localStorage', () => {
    const store = useConfigStore();
    store.setGameType('turn_based');
    expect(localStorage.getItem(STORAGE_KEY_GAME_TYPE)).toBe('turn_based');
  });
});
