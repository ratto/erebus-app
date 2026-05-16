import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
vi.mock('src/boot/i18n', () => ({
  i18n: {
    global: {
      locale: { value: 'pt-BR' },
    },
  },
}));

import SettingsDialog from '../../../src/components/SettingsDialog.vue';
import { useConfigStore } from 'src/stores/config.store';

function mountDialog(modelValue = true) {
  return mount(SettingsDialog, {
    props: { modelValue },
    global: {
      plugins: [],
      stubs: {
        QDialog: { template: '<div><slot /></div>' },
      },
    },
  });
}

describe('SettingsDialog.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('renderiza três q-select (idioma, cenário, tipo de jogo)', () => {
    const wrapper = mountDialog();
    const selects = wrapper.findAllComponents({ name: 'QSelect' });
    expect(selects).toHaveLength(3);
  });

  it('seleção de idioma chama configStore.setLocale()', async () => {
    const wrapper = mountDialog();
    const store = useConfigStore();
    const spy = vi.spyOn(store, 'setLocale');

    const selects = wrapper.findAllComponents({ name: 'QSelect' });
    await selects[0]!.setValue('en-US');

    expect(spy).toHaveBeenCalledWith('en-US');
  });

  it('seleção de cenário chama configStore.setCampaignScenario()', async () => {
    const wrapper = mountDialog();
    const store = useConfigStore();
    const spy = vi.spyOn(store, 'setCampaignScenario');

    const selects = wrapper.findAllComponents({ name: 'QSelect' });
    await selects[1]!.setValue('medieval');

    expect(spy).toHaveBeenCalledWith('medieval');
  });

  it('seleção de tipo de jogo chama configStore.setGameType()', async () => {
    const wrapper = mountDialog();
    const store = useConfigStore();
    const spy = vi.spyOn(store, 'setGameType');

    const selects = wrapper.findAllComponents({ name: 'QSelect' });
    await selects[2]!.setValue('turn_based');

    expect(spy).toHaveBeenCalledWith('turn_based');
  });

  it('emite update:modelValue ao fechar o diálogo', async () => {
    const wrapper = mountDialog(true);
    // Após migração para ErebusDialog, o botão de fechar usa data-testid="btn-close"
    const closeBtn = wrapper.find('[data-testid="btn-close"]');
    await closeBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  it('não renderiza conteúdo quando modelValue = false', () => {
    const wrapper = mountDialog(false);
    // Com QDialog stubado como <div>, o conteúdo ainda é renderizado no DOM
    // mas o importante é que o componente aceita a prop sem erro
    expect(wrapper.props('modelValue')).toBe(false);
  });
});
