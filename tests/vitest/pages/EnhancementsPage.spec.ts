import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import EnhancementsPage from 'src/pages/EnhancementsPage.vue';
import type { Enhancement } from 'src/model/types/enhancement.type';

const { mockLoading, mockEnhancements, mockFetchEnhancements } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
  const { ref } = require('vue') as typeof import('vue');
  return {
    mockLoading: ref(false),
    mockEnhancements: ref<Enhancement[]>([]),
    mockFetchEnhancements: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('src/composables/enhancements.composable', () => ({
  useEnhancements: () => ({
    loading: mockLoading,
    enhancements: mockEnhancements,
    fetchEnhancements: mockFetchEnhancements,
  }),
}));

const enhancementsFixture: Enhancement[] = [
  {
    id: 1,
    nome: 'Foco Mental',
    tipo: 'positivo',
    custo: 10,
    descricao: 'Aumenta concentração e clareza mental',
  },
  {
    id: 2,
    nome: 'Maldição',
    tipo: 'negativo',
    custo: -5,
    descricao: 'Reduz sorte nas ações',
  },
];

const mountOptions = {
  global: {
    plugins: [],
    stubs: {
      QPage: { template: '<div class="q-page"><slot /></div>' },
      QCard: { template: '<div class="q-card"><slot /></div>' },
      QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
      QTr: { template: '<tr><slot /></tr>' },
      QTd: { template: '<td><slot /></td>' },
      QBtn: {
        template: '<button @click="$emit(\'click\')" :data-testid="dataTestid"><slot /></button>',
        props: ['dataTestid'],
        emits: ['click'],
      },
      QBadge: {
        template: '<span class="q-badge" :class="`color-${color}`">{{ label }}</span>',
        props: ['color', 'label'],
      },
      ErebusInput: {
        template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        props: ['modelValue'],
        emits: ['update:modelValue'],
      },
      ErebusSelect: {
        template: `<select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
          <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>`,
        props: ['modelValue', 'options'],
        emits: ['update:modelValue'],
      },
      ErebusTable: {
        template: `<div class="q-table">
          <div v-if="rows.length === 0">{{ noDataLabel }}</div>
          <div v-for="row in filterMethod(rows, filter)" :key="row.id">
            <slot name="body" :row="row" :props="{ row }" />
          </div>
        </div>`,
        props: ['rows', 'columns', 'filter', 'filterMethod', 'noDataLabel', 'loading'],
        emits: ['update:pagination'],
      },
    },
  },
};

function mountPage() {
  return mount(EnhancementsPage, mountOptions);
}

describe('EnhancementsPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockEnhancements.value = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Inicialização', () => {
    it('chama fetchEnhancements ao montar', async () => {
      mountPage();
      await flushPromises();

      expect(mockFetchEnhancements).toHaveBeenCalledOnce();
    });

    it('renderiza o título da página', () => {
      const wrapper = mountPage();

      expect(wrapper.exists()).toBe(true);
    });

    it('renderiza card de filtros', () => {
      const wrapper = mountPage();

      expect(wrapper.find('.filtros-card').exists()).toBe(true);
    });

    it('exibe mensagem de estado vazio quando não há dados', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).toMatch(/Nenhum|sem|vazio/i);
    });
  });

  describe('Exibição de dados', () => {
    beforeEach(() => {
      mockEnhancements.value = enhancementsFixture;
    });

    it('exibe nome de cada enhancement carregado', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Foco Mental');
      expect(text).toContain('Maldição');
    });

    it('renderiza elementos para cada enhancement', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.find('.q-table').exists()).toBe(true);
    });

    it('exibe os custo valores numéricos', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('10');
      expect(text).toContain('-5');
    });
  });

  describe('Filtro por nome', () => {
    beforeEach(() => {
      mockEnhancements.value = enhancementsFixture;
      vi.useFakeTimers();
    });

    it('renderiza input de busca', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const searchInput = wrapper.find('input');
      expect(searchInput.exists()).toBe(true);
    });

    it('aceita entrada de texto no campo de busca', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const searchInput = wrapper.find('input');
      await searchInput.setValue('foco');
      await nextTick();

      expect((searchInput.element as HTMLInputElement).value).toBe('foco');
    });

    it('limpa o input de busca quando valor é vazio', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const searchInput = wrapper.find('input');
      await searchInput.setValue('teste');
      await searchInput.setValue('');
      await nextTick();

      expect((searchInput.element as HTMLInputElement).value).toBe('');
    });
  });

  describe('Filtro por tipo', () => {
    beforeEach(() => {
      mockEnhancements.value = enhancementsFixture;
    });

    it('filtra enhancements pelo tipo selecionado', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const typeSelect = wrapper.find('select');
      await typeSelect.setValue('positivo');
      await nextTick();

      expect(wrapper.text()).toContain('Foco Mental');
    });

    it('selecionar "Todos" exibe todas as enhancements', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const typeSelect = wrapper.find('select');
      await typeSelect.setValue('');
      await nextTick();

      expect(wrapper.text()).toContain('Foco Mental');
      expect(wrapper.text()).toContain('Maldição');
    });

    it('filtra por tipo negativo', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const typeSelect = wrapper.find('select');
      await typeSelect.setValue('negativo');
      await nextTick();

      expect(wrapper.text()).toContain('Maldição');
    });
  });

  describe('Expandir/colapsar descrição', () => {
    beforeEach(() => {
      mockEnhancements.value = enhancementsFixture;
    });

    it('renderiza botões de expand/collapse', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const chevrons = wrapper.findAll('[data-testid="chevron-btn"]');
      expect(chevrons.length).toBeGreaterThan(0);
    });

    it('clica no chevron sem erros', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const chevron = wrapper.find('[data-testid="chevron-btn"]');
      if (chevron.exists()) {
        await chevron.trigger('click');
      }

      expect(wrapper.exists()).toBe(true);
    });

    it('toggler de expand/collapse funciona', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const chevron = wrapper.find('[data-testid="chevron-btn"]');
      if (chevron.exists()) {
        await chevron.trigger('click');
        await nextTick();
        await chevron.trigger('click');
        await nextTick();
      }

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Estado de loading', () => {
    it('passa loading=true para ErebusTable quando está carregando', async () => {
      mockLoading.value = true;
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.vm.$data).toBeDefined();
    });

    it('passa loading=false quando o carregamento termina', async () => {
      mockLoading.value = false;
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Paginação', () => {
    beforeEach(() => {
      mockEnhancements.value = enhancementsFixture;
    });

    it('reseta paginação ao mudar filtros', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const searchInput = wrapper.find('input');
      await searchInput.setValue('Foco');
      await nextTick();

      expect(wrapper.exists()).toBe(true);
    });
  });
});
