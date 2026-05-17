import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import ItemsPage from 'src/pages/ItemsPage.vue';
import type { Item, ItemInput } from 'src/model/types/item.type';

// ─── Mock de erebusMessage (SPEC-051) ─────────────────────────────────────────

const { mockSuccess, mockDanger } = vi.hoisted(() => ({
  mockSuccess: vi.fn(),
  mockDanger: vi.fn(),
}));

vi.mock('src/model/utils/message', () => ({
  erebusMessage: () => ({
    success: mockSuccess,
    info: vi.fn(),
    warning: vi.fn(),
    danger: mockDanger,
    continuous: vi.fn(() => ({ dismiss: vi.fn() })),
  }),
}));

const mountOptions = {
  global: {
    plugins: [createPinia()],
    stubs: {
      QPage: { template: '<div class="q-page"><slot /></div>' },
      QIcon: { template: '<span class="q-icon"></span>' },
      QInput: {
        template: `<input
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :placeholder="placeholder"
          :data-testid="dataTestid"
        />`,
        props: ['modelValue', 'placeholder', 'dataTestid'],
        emits: ['update:modelValue'],
      },
      QSelect: {
        template: `<select
          :value="modelValue"
          @change="$emit('update:modelValue', $event.target.value)"
          :data-testid="dataTestid"
        >
          <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>`,
        props: ['modelValue', 'options', 'dataTestid'],
        emits: ['update:modelValue'],
      },
      QBtn: {
        template: `<button
          @click="$emit('click')"
          :disabled="disable"
          :data-testid="dataTestid"
        ><slot /></button>`,
        props: ['disable', 'dataTestid'],
        emits: ['click'],
      },
      QTr: { template: '<tr><slot /></tr>' },
      QTd: { template: '<td><slot /></td>' },
      QBadge: {
        template: '<span class="q-badge" :class="`color-${color}`">{{ label }}</span>',
        props: ['color', 'label'],
      },
      QTooltip: { template: '<div></div>' },
      ErebusTable: {
        template: `<div class="erebus-table">
          <div v-if="rows.length === 0">{{ noDataLabel }}</div>
          <div v-for="row in rows" :key="row.id">
            <slot name="body" :row="row" :props="{ row }" />
          </div>
        </div>`,
        props: ['rows', 'columns', 'noDataLabel'],
        emits: ['update:pagination'],
      },
      ItemFormDialog: {
        name: 'ItemFormDialog',
        template: '<div data-testid="item-form-dialog"></div>',
        emits: ['confirm', 'update:modelValue'],
        props: ['modelValue', 'mode', 'item'],
      },
      DeleteItemDialog: { template: '<div></div>' },
    },
  },
};

function mountPage() {
  setActivePinia(createPinia());
  return mount(ItemsPage, mountOptions);
}

// Helper: simula confirmação no diálogo de item
async function triggerFormConfirm(
  wrapper: ReturnType<typeof mountPage>,
  input: ItemInput = { name: 'Espada', type: 'mundane', description: '' },
) {
  const dialog = wrapper.findComponent({ name: 'ItemFormDialog' });
  await dialog.vm.$emit('confirm', input);
  await nextTick();
}

describe('ItemsPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('renderiza a página sem erros', () => {
      const wrapper = mountPage();

      expect(wrapper.exists()).toBe(true);
    });

    it('renderiza o campo de busca', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="search-input"]').exists()).toBe(true);
    });

    it('renderiza o select de tipo', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="select-type"]').exists()).toBe(true);
    });

    it('renderiza o botão de novo item', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="btn-new-item"]').exists()).toBe(true);
    });

    it('renderiza a tabela de itens', () => {
      const wrapper = mountPage();

      expect(wrapper.find('.erebus-table').exists()).toBe(true);
    });
  });

  describe('Filtros e entrada de dados', () => {
    it('aceita texto no campo de busca', async () => {
      const wrapper = mountPage();
      await nextTick();

      const searchInput = wrapper.find('[data-testid="search-input"]');
      await searchInput.setValue('teste');

      expect((searchInput.element as HTMLInputElement).value).toBe('teste');
    });

    it('limpa o campo de busca quando necessário', async () => {
      const wrapper = mountPage();
      await nextTick();

      const searchInput = wrapper.find('[data-testid="search-input"]');
      await searchInput.setValue('teste');
      await searchInput.setValue('');
      await nextTick();

      expect((searchInput.element as HTMLInputElement).value).toBe('');
    });
  });

  describe('Componentes de interface', () => {
    it('renderiza layout com col-grow', () => {
      const wrapper = mountPage();

      expect(wrapper.find('.col-grow').exists()).toBe(true);
    });

    it('botão novo item está acessível', () => {
      const wrapper = mountPage();

      const btn = wrapper.find('[data-testid="btn-new-item"]');
      expect(btn.exists()).toBe(true);
    });
  });

  // ── Notificações via erebusMessage (SPEC-051) ─────────────────────────────

  describe('Notificações via erebusMessage', () => {
    it('confirmar criação de item → erebusMessage().success é chamado', async () => {
      const wrapper = mountPage();
      await nextTick();

      await triggerFormConfirm(wrapper);

      expect(mockSuccess).toHaveBeenCalledOnce();
    });

    it('confirmar segunda criação de item também chama erebusMessage().success', async () => {
      const wrapper = mountPage();
      await nextTick();

      // Confirma duas criações distintas
      await triggerFormConfirm(wrapper, { name: 'Escudo', type: 'mundane', description: '' });
      await triggerFormConfirm(wrapper, { name: 'Poção', type: 'consumable', description: '' });

      expect(mockSuccess).toHaveBeenCalledTimes(2);
    });
  });
});
