import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Quasar } from 'quasar';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';

import type { ProtectiveEquipment } from 'src/model/types/protective-equipment.type';

const { mockLoading, mockProtectiveEquipments, mockFetchProtectiveEquipment } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
  const { ref } = require('vue') as typeof import('vue');
  return {
    mockLoading: ref(false),
    mockProtectiveEquipments: ref<ProtectiveEquipment[]>([]),
    mockFetchProtectiveEquipment: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('src/composables/protective-equipment.composable', () => ({
  useProtectiveEquipment: () => ({
    loading: mockLoading,
    protectiveEquipments: mockProtectiveEquipments,
    fetchProtectiveEquipment: mockFetchProtectiveEquipment,
  }),
}));

import ProtectiveEquipmentPage from '../../../src/pages/ProtectiveEquipmentPage.vue';
import ErebusTableComponent from '../../../src/components/common/ErebusTable.vue';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const equipmentFixture: ProtectiveEquipment[] = [
  {
    id: 1,
    name: 'Colete de Kevlar',
    cost: null,
    availability: null,
    weightKg: null,
    dexPenalty: 0,
    agiPenalty: 1,
    description: 'Proteção contra projéteis.',
    source: 'Daemon RPG p.112',
    protectiveIndex: [
      { damageType: 'KINETIC', ipValue: 4 },
      { damageType: 'BALLISTIC', ipValue: 6 },
    ],
  },
];

// ─── Mount helper ─────────────────────────────────────────────────────────────

const i18nInstance = createI18n({ locale: 'pt-BR', legacy: false, messages });

const mountOptions = {
  global: {
    plugins: [[Quasar, {}], i18nInstance],
    stubs: {
      QPage: { template: '<div><slot /></div>' },
      ErebusInput: {
        template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        props: ['modelValue', 'label', 'placeholder', 'innerClass'],
        emits: ['update:modelValue'],
      },
      ErebusSelect: {
        template: `<select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
          <option v-for="opt in options" :key="String(opt.value)" :value="String(opt.value)">{{ opt.label }}</option>
        </select>`,
        props: ['modelValue', 'options', 'label'],
        emits: ['update:modelValue'],
      },
      [ErebusTableComponent]: {
        template: `<div class="erebus-table">
          <div v-if="rows.length === 0">{{ noDataLabel }}</div>
          <template v-for="row in rows" :key="row.id">
            <slot name="body" :row="row" :props="{ row }" />
          </template>
        </div>`,
        props: ['rows', 'columns', 'loading', 'noDataLabel', 'rowKey', 'rowsPerPageOptions'],
      },
    },
  },
};

function mountPage() {
  return mount(ProtectiveEquipmentPage, mountOptions);
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('ProtectiveEquipmentPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockProtectiveEquipments.value = [];
  });

  // ── Inicialização ──────────────────────────────────────────────────────────

  describe('Inicialização', () => {
    it('chama fetchProtectiveEquipment sem argumentos ao montar', async () => {
      mountPage();
      await flushPromises();

      expect(mockFetchProtectiveEquipment).toHaveBeenCalledOnce();
      expect(mockFetchProtectiveEquipment).toHaveBeenCalledWith();
    });

    it('renderiza o botão clear-filters', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="clear-filters"]').exists()).toBe(true);
    });
  });

  // ── Exibição ───────────────────────────────────────────────────────────────

  describe('Exibição', () => {
    beforeEach(() => {
      mockProtectiveEquipments.value = equipmentFixture;
    });

    it('nome do equipamento aparece no DOM', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).toContain('Colete de Kevlar');
    });

    it('ErebusTable recebe as rows com os dados do equipamento', async () => {
      const wrapper = mountPage();
      await flushPromises();

      // Verifica que o ErebusTable stub recebeu os dados corretos via prop :rows
      const table = wrapper.findComponent(ErebusTableComponent);
      const rows = table.props('rows') as typeof equipmentFixture;
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Colete de Kevlar');
      expect(rows[0]!.dexPenalty).toBe(0);
      expect(rows[0]!.agiPenalty).toBe(1);
    });
  });

  // ── Filtro por texto (com debounce) ───────────────────────────────────────

  describe('Filtro por texto (debounce 300ms)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('não chama fetchProtectiveEquipment imediatamente ao digitar', async () => {
      const wrapper = mountPage();
      await flushPromises();
      mockFetchProtectiveEquipment.mockClear();

      const input = wrapper.find('input');
      await input.setValue('Colete');
      await nextTick();

      expect(mockFetchProtectiveEquipment).not.toHaveBeenCalled();
    });

    it('chama fetchProtectiveEquipment com { equipment } após 300ms', async () => {
      const wrapper = mountPage();
      await flushPromises();
      mockFetchProtectiveEquipment.mockClear();

      const input = wrapper.find('input');
      await input.setValue('Colete');
      await nextTick();

      vi.advanceTimersByTime(300);
      await nextTick();

      expect(mockFetchProtectiveEquipment).toHaveBeenCalledWith({ equipment: 'Colete' });
    });

    it('não dispara antes dos 300ms (dispara após)', async () => {
      const wrapper = mountPage();
      await flushPromises();
      mockFetchProtectiveEquipment.mockClear();

      const input = wrapper.find('input');
      await input.setValue('Colete');
      await nextTick();

      vi.advanceTimersByTime(299);
      await nextTick();
      expect(mockFetchProtectiveEquipment).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      await nextTick();
      expect(mockFetchProtectiveEquipment).toHaveBeenCalledOnce();
    });
  });

  // ── Filtro por damageType (sem debounce) ──────────────────────────────────

  describe('Filtro por damageType', () => {
    it('emitir update:modelValue no ErebusSelect chama fetchProtectiveEquipment imediatamente', async () => {
      const wrapper = mountPage();
      await flushPromises();
      mockFetchProtectiveEquipment.mockClear();

      // ErebusSelect está stubado como <select>
      const select = wrapper.find('select');
      await select.setValue('KINETIC');
      await nextTick();

      expect(mockFetchProtectiveEquipment).toHaveBeenCalledWith({ damageType: 'KINETIC' });
    });

    it('selecionar null (string vazia) chama fetchProtectiveEquipment sem filtro de damageType', async () => {
      const wrapper = mountPage();
      await flushPromises();
      mockFetchProtectiveEquipment.mockClear();

      const select = wrapper.find('select');
      await select.setValue('');
      await nextTick();

      // Com valor vazio, buildFilters não inclui damageType
      expect(mockFetchProtectiveEquipment).toHaveBeenCalled();
    });
  });

  // ── Filtro numérico ────────────────────────────────────────────────────────

  describe('Filtro numérico (onNumericFilterChange)', () => {
    it('emitir update:model-value no QInput de minDexPenalty chama fetchProtectiveEquipment', async () => {
      const wrapper = mountPage();
      await flushPromises();
      mockFetchProtectiveEquipment.mockClear();

      // QInput nativo para filtros numéricos (não ErebusInput)
      const numericInput = wrapper.find('[data-testid="input-min-dex-penalty"]');
      await numericInput.setValue('2');
      await nextTick();

      expect(mockFetchProtectiveEquipment).toHaveBeenCalled();
    });
  });

  // ── clearFilters ───────────────────────────────────────────────────────────

  describe('clearFilters', () => {
    it('clicar em clear-filters chama fetchProtectiveEquipment com objeto vazio', async () => {
      const wrapper = mountPage();
      await flushPromises();
      mockFetchProtectiveEquipment.mockClear();

      await wrapper.find('[data-testid="clear-filters"]').trigger('click');
      await nextTick();

      expect(mockFetchProtectiveEquipment).toHaveBeenCalledWith({});
    });
  });

  // ── Expand / Collapse ──────────────────────────────────────────────────────

  describe('Expand / Collapse', () => {
    beforeEach(() => {
      mockProtectiveEquipments.value = equipmentFixture;
    });

    it('descrição não visível antes do clique', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).not.toContain('Proteção contra projéteis.');
    });

    it('clicar no chevron exibe description e source', async () => {
      const wrapper = mountPage();
      await flushPromises();

      await wrapper.find('[data-testid="chevron-btn"]').trigger('click');
      await nextTick();

      expect(wrapper.text()).toContain('Proteção contra projéteis.');
      expect(wrapper.text()).toContain('Daemon RPG p.112');
    });

    it('segundo clique no chevron oculta a descrição', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const chevron = wrapper.find('[data-testid="chevron-btn"]');
      await chevron.trigger('click');
      await nextTick();
      await chevron.trigger('click');
      await nextTick();

      expect(wrapper.text()).not.toContain('Proteção contra projéteis.');
    });
  });
});
