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

const STORAGE_KEY = 'erebus_locale';

describe('config.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    mockLocaleRef.value = 'pt-BR';
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('estado inicial sem localStorage: locale = pt-BR', () => {
    const store = useConfigStore();
    expect(store.locale).toBe('pt-BR');
  });

  it('estado inicial com localStorage salvo: lê en-US do storage', () => {
    localStorage.setItem(STORAGE_KEY, 'en-US');
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
    expect(localStorage.getItem(STORAGE_KEY)).toBe('en-US');
  });

  it('setLocale atualiza i18n.global.locale.value', () => {
    const store = useConfigStore();
    store.setLocale('en-US');
    expect(mockLocaleRef.value).toBe('en-US');
  });
});
