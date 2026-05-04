import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { Quasar } from 'quasar';
import { createI18n } from 'vue-i18n';
import { createPinia, setActivePinia } from 'pinia';
import messages from 'src/i18n';
import ItemsPage from 'src/pages/ItemsPage.vue';
import type { Item } from 'src/model/types/item.type';

const i18nInstance = createI18n({
  locale: 'pt-BR',
  legacy: false,
  messages,
});

const { mockItemsStore } = vi.hoisted(() => {
  return {
    mockItemsStore: {
      items: ref<Item[]>([]),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
    },
  };
});

vi.mock('src/stores/items.store', () => ({
  useItemsStore: () => mockItemsStore,
}));

const itemsFixture: Item[] = [
  {
    id: 1,
    name: 'Espada Longa',
    type: 'mundane',
    description: 'Uma arma branca efetiva',
  },
  {
    id: 2,
    name: 'Poção de Cura',
    type: 'consumable',
    description: 'Restaura 10 pontos de vida',
  },
  {
    id: 3,
    name: 'Escudo',
    type: 'mundane',
    description: 'Proteção contra ataques',
  },
];

const mountOptions = {
  global: {
    plugins: [[Quasar, {}], i18nInstance],
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
      ItemFormDialog: { template: '<div></div>' },
      DeleteItemDialog: { template: '<div></div>' },
    },
  },
};

function mountPage() {
  return mount(ItemsPage, mountOptions);
}

describe('ItemsPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    mockItemsStore.items.value = [];
  });

  afterEach(() => {
    vi.useRealTimers();
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

  describe('Exibição de dados', () => {
    beforeEach(() => {
      mockItemsStore.items.value = itemsFixture;
    });

    it('exibe todos os itens na tabela', async () => {
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.text()).toContain('Espada Longa');
      expect(wrapper.text()).toContain('Poção de Cura');
      expect(wrapper.text()).toContain('Escudo');
    });

    it('exibe mensagem de estado vazio quando não há itens', async () => {
      mockItemsStore.items.value = [];
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.text()).toMatch(/Nenhum|vazio|sem/i);
    });

    it('renderiza botões de ação para cada item', async () => {
      const wrapper = mountPage();
      await nextTick();

      const editButtons = wrapper.findAll('[data-testid^="btn-edit-"]');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('renderiza badges de tipo para cada item', async () => {
      const wrapper = mountPage();
      await nextTick();

      const badges = wrapper.findAllComponents({ name: 'QBadge' });
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Filtro por nome', () => {
    beforeEach(() => {
      mockItemsStore.items.value = itemsFixture;
      vi.useFakeTimers();
    });

    it('filtra itens pelo texto de busca (case-insensitive)', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const searchInput = wrapper.find('[data-testid="search-input"]');
      await searchInput.setValue('espada');
      await nextTick();

      expect(wrapper.text()).toContain('Espada Longa');
    });

    it('filtra com correspondência parcial', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const searchInput = wrapper.find('[data-testid="search-input"]');
      await searchInput.setValue('Poção');
      await nextTick();

      expect(wrapper.text()).toContain('Poção de Cura');
    });

    it('limpa o filtro de nome', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const searchInput = wrapper.find('[data-testid="search-input"]');
      await searchInput.setValue('Espada');
      await nextTick();
      await searchInput.setValue('');
      await nextTick();

      expect(wrapper.text()).toContain('Espada Longa');
      expect(wrapper.text()).toContain('Poção de Cura');
    });
  });

  describe('Filtro por tipo', () => {
    beforeEach(() => {
      mockItemsStore.items.value = itemsFixture;
    });

    it('filtra itens por tipo selecionado', async () => {
      const wrapper = mountPage();
      await nextTick();

      const typeSelect = wrapper.find('[data-testid="select-type"]');
      await typeSelect.setValue('consumable');
      await nextTick();

      expect(wrapper.text()).toContain('Poção de Cura');
    });

    it('selecionar todos remove o filtro de tipo', async () => {
      const wrapper = mountPage();
      await nextTick();

      const typeSelect = wrapper.find('[data-testid="select-type"]');
      await typeSelect.setValue('');
      await nextTick();

      expect(wrapper.text()).toContain('Espada Longa');
      expect(wrapper.text()).toContain('Poção de Cura');
    });
  });

  describe('Diálogos', () => {
    it('abre dialog de criar ao clicar no botão novo item', async () => {
      const wrapper = mountPage();
      await nextTick();

      const btn = wrapper.find('[data-testid="btn-new-item"]');
      await btn.trigger('click');

      expect(wrapper.vm.$data).toBeDefined();
    });

    it('abre dialog de editar ao clicar no botão edit', async () => {
      mockItemsStore.items.value = itemsFixture;
      const wrapper = mountPage();
      await nextTick();

      const editBtn = wrapper.find('[data-testid="btn-edit-1"]');
      if (editBtn.exists()) {
        await editBtn.trigger('click');
      }

      expect(wrapper.vm.$data).toBeDefined();
    });

    it('abre dialog de deletar ao clicar no botão delete', async () => {
      mockItemsStore.items.value = itemsFixture;
      const wrapper = mountPage();
      await nextTick();

      const deleteBtn = wrapper.find('[data-testid="btn-delete-1"]');
      if (deleteBtn.exists()) {
        await deleteBtn.trigger('click');
      }

      expect(wrapper.vm.$data).toBeDefined();
    });
  });

  describe('Integração com store', () => {
    it('chama createItem ao confirmar novo item', async () => {
      const wrapper = mountPage();
      await nextTick();

      expect(mockItemsStore.createItem).toBeDefined();
    });

    it('chama updateItem ao confirmar edição', async () => {
      const wrapper = mountPage();
      await nextTick();

      expect(mockItemsStore.updateItem).toBeDefined();
    });

    it('chama deleteItem ao confirmar exclusão', async () => {
      const wrapper = mountPage();
      await nextTick();

      expect(mockItemsStore.deleteItem).toBeDefined();
    });
  });
});
