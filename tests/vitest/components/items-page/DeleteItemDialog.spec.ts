import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import DeleteItemDialog from 'src/components/items-page/DeleteItemDialog.vue';
import type { Item } from 'src/model/types/item.type';

const testItem: Item = {
  id: '1',
  name: 'Espada Longa',
  type: 'mundane',
  description: 'Uma espada de ferro',
};

/**
 * Após a migração para ErebusDialog, o componente usa ErebusDialog como wrapper.
 * O stub de QDialog (interno ao ErebusDialog) ainda é necessário.
 * Os botões agora usam data-testid="btn-cancel" e data-testid="btn-confirm"
 * do ErebusDialog, não mais os data-testid específicos do DeleteItemDialog.
 */
const mountOptions = {
  props: {
    modelValue: true,
    item: testItem,
  },
  global: {
    plugins: [],
    stubs: {
      QDialog: { template: '<div><slot /></div>' },
    },
  },
};

function mountDialog(props = {}) {
  return mount(DeleteItemDialog, {
    ...mountOptions,
    props: { ...mountOptions.props, ...props },
  });
}

describe('DeleteItemDialog.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o componente sem erros', () => {
    const wrapper = mountDialog();

    expect(wrapper.exists()).toBe(true);
  });

  it('exibe o título de confirmação de exclusão', () => {
    const wrapper = mountDialog();

    expect(wrapper.text()).toMatch(/[Dd]eleta|[Rr]emov|[Cc]onfirm/i);
  });

  it('exibe o nome do item na mensagem de confirmação', () => {
    const wrapper = mountDialog();

    expect(wrapper.text()).toContain('Espada Longa');
  });

  it('renderiza botão de cancel', () => {
    const wrapper = mountDialog();

    const cancelBtn = wrapper.find('[data-testid="btn-cancel"]');
    expect(cancelBtn.exists()).toBe(true);
  });

  it('renderiza botão de confirmação', () => {
    const wrapper = mountDialog();

    const confirmBtn = wrapper.find('[data-testid="btn-confirm"]');
    expect(confirmBtn.exists()).toBe(true);
  });

  it('emite update:modelValue=false quando cancel é clicado', async () => {
    const wrapper = mountDialog();

    const cancelBtn = wrapper.find('[data-testid="btn-cancel"]');
    await cancelBtn.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeDefined();
  });

  it('emite confirm e update:modelValue=false quando botão de confirmação é clicado', async () => {
    const wrapper = mountDialog();

    const confirmBtn = wrapper.find('[data-testid="btn-confirm"]');
    await confirmBtn.trigger('click');

    expect(wrapper.emitted('confirm')).toBeDefined();
    expect(wrapper.emitted('update:modelValue')).toBeDefined();
  });

  it('emite confirm apenas uma vez ao clicar confirm', async () => {
    const wrapper = mountDialog();

    const confirmBtn = wrapper.find('[data-testid="btn-confirm"]');
    await confirmBtn.trigger('click');

    const confirmEmitted = wrapper.emitted('confirm');
    expect(confirmEmitted).toHaveLength(1);
  });

  it('mantém a mensagem correta ao mudar o item', async () => {
    const wrapper = mountDialog();

    const newItem: Item = {
      id: '2',
      name: 'Poção Mágica',
      type: 'consumable',
      description: 'Uma poção rara',
    };

    await wrapper.setProps({ item: newItem });
    await nextTick();

    expect(wrapper.text()).toContain('Poção Mágica');
    expect(wrapper.text()).not.toContain('Espada Longa');
  });

  it('renderiza card com tipo danger', () => {
    const wrapper = mountDialog();

    expect(wrapper.find('.erebus-dialog-card--danger').exists()).toBe(true);
  });

  it('renderiza a seção de corpo do diálogo', () => {
    const wrapper = mountDialog();

    expect(wrapper.find('.erebus-dialog-body').exists()).toBe(true);
  });
});
