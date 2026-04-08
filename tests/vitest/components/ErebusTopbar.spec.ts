import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { Quasar } from 'quasar';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';

// Mock i18n boot para que useConfigStore não falhe ao importar i18n
vi.mock('src/boot/i18n', () => ({
  i18n: {
    global: {
      locale: { value: 'pt-BR' },
    },
  },
}));

import ErebusTopbar from '../../../src/components/ErebusTopbar.vue';
import { useConfigStore } from 'src/stores/config.store';

const i18nInstance = createI18n({ locale: 'pt-BR', legacy: false, messages });

function mountTopbar() {
  return mount(ErebusTopbar, {
    global: {
      plugins: [[Quasar, {}], i18nInstance],
      stubs: {
        QHeader: { template: '<div><slot /></div>' },
      },
    },
  });
}

describe('ErebusTopbar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renderiza botões PT e EN', () => {
    const wrapper = mountTopbar();
    expect(wrapper.text()).toContain('PT');
    expect(wrapper.text()).toContain('EN');
  });

  it('clique em EN chama configStore.setLocale("en-US")', async () => {
    const wrapper = mountTopbar();
    const store = useConfigStore();
    const spy = vi.spyOn(store, 'setLocale');

    const buttons = wrapper.findAllComponents({ name: 'QBtn' });
    const enBtn = buttons.find((b) => b.props('label') === 'EN');
    expect(enBtn).toBeDefined();
    await enBtn!.trigger('click');

    expect(spy).toHaveBeenCalledWith('en-US');
  });

  it('clique em PT chama configStore.setLocale("pt-BR")', async () => {
    const wrapper = mountTopbar();
    const store = useConfigStore();
    const spy = vi.spyOn(store, 'setLocale');

    const buttons = wrapper.findAllComponents({ name: 'QBtn' });
    const ptBtn = buttons.find((b) => b.props('label') === 'PT');
    expect(ptBtn).toBeDefined();
    await ptBtn!.trigger('click');

    expect(spy).toHaveBeenCalledWith('pt-BR');
  });

  it('botão PT tem classe lang-active quando locale = pt-BR', () => {
    const wrapper = mountTopbar();
    const store = useConfigStore();
    store.locale = 'pt-BR';

    const buttons = wrapper.findAllComponents({ name: 'QBtn' });
    const ptBtn = buttons.find((b) => b.props('label') === 'PT');
    expect(ptBtn).toBeDefined();
    // A classe lang-active é aplicada via :class binding no root do QBtn
    expect(ptBtn!.classes()).toContain('lang-active');
  });
});
