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

  it('não renderiza botões PT e EN', () => {
    const wrapper = mountTopbar();
    const buttons = wrapper.findAllComponents({ name: 'QBtn' });
    const ptBtn = buttons.find((b) => b.props('label') === 'PT');
    const enBtn = buttons.find((b) => b.props('label') === 'EN');
    expect(ptBtn).toBeUndefined();
    expect(enBtn).toBeUndefined();
  });

  it('renderiza botão de settings com icon="settings"', () => {
    const wrapper = mountTopbar();
    const buttons = wrapper.findAllComponents({ name: 'QBtn' });
    const settingsBtn = buttons.find((b) => b.props('icon') === 'settings');
    expect(settingsBtn).toBeDefined();
  });

  it('clique no botão settings emite toggle-settings', async () => {
    const wrapper = mountTopbar();
    const buttons = wrapper.findAllComponents({ name: 'QBtn' });
    const settingsBtn = buttons.find((b) => b.props('icon') === 'settings');
    expect(settingsBtn).toBeDefined();
    await settingsBtn!.trigger('click');
    expect(wrapper.emitted('toggle-settings')).toBeTruthy();
  });

  it('clique no botão de menu emite toggle-menu', async () => {
    const wrapper = mountTopbar();
    const menuBtn = wrapper.find('[data-testid="btn-menu"]');
    await menuBtn.trigger('click');
    expect(wrapper.emitted('toggle-menu')).toBeTruthy();
  });

  it('clique no botão de chat emite toggle-chat', async () => {
    const wrapper = mountTopbar();
    const buttons = wrapper.findAllComponents({ name: 'QBtn' });
    const chatBtn = buttons.find((b) => b.props('icon') === 'chat');
    expect(chatBtn).toBeDefined();
    await chatBtn!.trigger('click');
    expect(wrapper.emitted('toggle-chat')).toBeTruthy();
  });
});
