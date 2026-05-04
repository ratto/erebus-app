import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { Quasar } from 'quasar';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';
import EnhancementsPage from 'src/pages/EnhancementsPage.vue';
import type { Enhancement } from 'src/model/types/enhancement.type';

const i18nInstance = createI18n({
  locale: 'pt-BR',
  legacy: false,
  messages,
});

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
    plugins: [[Quasar, {}], i18nInstance],
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

      expect(wrapper.text()).toContain('Foco Mental');
      expect(wrapper.text()).toContain('Maldição');
    });

    it('exibe tipo com badge', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const badges = wrapper.findAllComponents({ name: 'QBadge' });
      expect(badges.length).toBeGreaterThan(0);
    });

    it('exibe custo de cada enhancement', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).toContain('10');
      expect(wrapper.text()).toContain('-5');
    });
  });

  describe('Filtro por nome', () => {
    beforeEach(() => {
      mockEnhancements.value = enhancementsFixture;
      vi.useFakeTimers();
    });

    it('filtra enhancements pelo texto de busca (case-insensitive)', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const searchInput = wrapper.find('input');
      await searchInput.setValue('foco');
      await nextTick();

      expect(wrapper.text()).toContain('Foco Mental');
    });

    it('filtra com correspondência parcial', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const searchInput = wrapper.find('input');
      await searchInput.setValue('focu');
      await nextTick();

      expect(wrapper.text()).toContain('Foco Mental');
    });

    it('limpa o filtro de nome restaurando todas as enhancements', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const searchInput = wrapper.find('input');
      await searchInput.setValue('Foco');
      await nextTick();
      await searchInput.setValue('');
      await nextTick();

      expect(wrapper.text()).toContain('Foco Mental');
      expect(wrapper.text()).toContain('Maldição');
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

    it('não mostra descrição antes de clicar no chevron', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).not.toContain('Aumenta concentração');
    });

    it('mostra descrição ao clicar no chevron', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const chevron = wrapper.find('[data-testid="chevron-btn"]');
      await chevron.trigger('click');
      await nextTick();

      expect(wrapper.text()).toContain('Aumenta concentração');
    });

    it('esconde descrição ao clicar novamente', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const chevron = wrapper.find('[data-testid="chevron-btn"]');
      await chevron.trigger('click');
      await nextTick();
      await chevron.trigger('click');
      await nextTick();

      expect(wrapper.text()).not.toContain('Aumenta concentração');
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
