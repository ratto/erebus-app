import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Quasar } from 'quasar';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';

import type { CapacityResult } from 'src/model/types/capacity.type';

const {
  mockLoading,
  mockResult,
  mockError,
  mockCalculateY,
  mockCalculateK,
  mockCalculateDamageBonus,
} = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
  const { ref } = require('vue') as typeof import('vue');
  return {
    mockLoading: ref(false),
    mockResult: ref<CapacityResult | null>(null),
    mockError: ref<string | null>(null),
    mockCalculateY: vi.fn().mockResolvedValue(undefined),
    mockCalculateK: vi.fn().mockResolvedValue(undefined),
    mockCalculateDamageBonus: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('src/composables/capacity.composable', () => ({
  useCapacity: () => ({
    loading: mockLoading,
    result: mockResult,
    error: mockError,
    calculateY: mockCalculateY,
    calculateK: mockCalculateK,
    calculateDamageBonus: mockCalculateDamageBonus,
  }),
}));

import CapacityPage from '../../../src/pages/CapacityPage.vue';

const i18nInstance = createI18n({ locale: 'pt-BR', legacy: false, messages });

const mountOptions = {
  global: {
    plugins: [[Quasar, {}], i18nInstance],
    stubs: {
      QPage: { template: '<div><slot /></div>' },
    },
  },
};

function mountPage() {
  return mount(CapacityPage, mountOptions);
}

describe('CapacityPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockResult.value = null;
    mockError.value = null;
  });

  // ── Renderização ──────────────────────────────────────────────────────────

  describe('Renderização', () => {
    it('renderiza as 3 QTabs', () => {
      const wrapper = mountPage();

      const tabs = wrapper.findAllComponents({ name: 'QTab' });
      expect(tabs).toHaveLength(3);
    });

    it('tab inicial é calculateY', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'QTabs' }).props('modelValue')).toBe('calculateY');
    });

    it('QTabPanels recebe modelValue="calculateY" inicialmente', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'QTabPanels' }).props('modelValue')).toBe('calculateY');
    });

    it('trocar para tab calculateK atualiza QTabPanels', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'calculateK');
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTabPanels' }).props('modelValue')).toBe('calculateK');
    });

    it('trocar para tab damageBonus atualiza QTabPanels', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'damageBonus');
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTabPanels' }).props('modelValue')).toBe('damageBonus');
    });
  });

  // ── Tab calculateY ─────────────────────────────────────────────────────────

  describe('Tab calculateY', () => {
    it('botão chama calculateY com os valores dos inputs', async () => {
      const wrapper = mountPage();

      // Tab calculateY é a ativa por default — apenas seus QInputs estão no DOM.
      const inputs = wrapper.findAllComponents({ name: 'QInput' });
      await inputs[0]!.vm.$emit('update:modelValue', 10);
      await inputs[1]!.vm.$emit('update:modelValue', 12.4);
      await nextTick();

      await wrapper.find('[data-testid="btn-calculate-y"]').trigger('click');
      await flushPromises();

      expect(mockCalculateY).toHaveBeenCalledWith(10, 12.4);
    });

    it('guard: não chama calculateY se yAttribute for null', async () => {
      const wrapper = mountPage();

      // Apenas yK preenchido, yAttribute permanece null
      const inputs = wrapper.findAllComponents({ name: 'QInput' });
      await inputs[1]!.vm.$emit('update:modelValue', 12.4);
      await nextTick();

      await wrapper.find('[data-testid="btn-calculate-y"]').trigger('click');
      await flushPromises();

      expect(mockCalculateY).not.toHaveBeenCalled();
    });

    it('guard: não chama calculateY se yK for null', async () => {
      const wrapper = mountPage();

      // Apenas yAttribute preenchido, yK permanece null
      const inputs = wrapper.findAllComponents({ name: 'QInput' });
      await inputs[0]!.vm.$emit('update:modelValue', 10);
      await nextTick();

      await wrapper.find('[data-testid="btn-calculate-y"]').trigger('click');
      await flushPromises();

      expect(mockCalculateY).not.toHaveBeenCalled();
    });
  });

  // ── Tab calculateK ─────────────────────────────────────────────────────────

  describe('Tab calculateK', () => {
    // Ao navegar para calculateK, apenas os QInputs dessa tab estão disponíveis no DOM.
    // inputs[0]=kAttribute, inputs[1]=kY na tab ativa.

    it('botão chama calculateK com os valores dos inputs', async () => {
      const wrapper = mountPage();

      // Navega para aba calculateK
      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'calculateK');
      await nextTick();

      const inputs = wrapper.findAllComponents({ name: 'QInput' });
      await inputs[0]!.vm.$emit('update:modelValue', 10);
      await inputs[1]!.vm.$emit('update:modelValue', 39.76);
      await nextTick();

      await wrapper.find('[data-testid="btn-calculate-k"]').trigger('click');
      await flushPromises();

      expect(mockCalculateK).toHaveBeenCalledWith(10, 39.76);
    });

    it('guard: não chama calculateK se kAttribute for null', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'calculateK');
      await nextTick();

      // Só kY preenchido, kAttribute permanece null
      const inputs = wrapper.findAllComponents({ name: 'QInput' });
      await inputs[1]!.vm.$emit('update:modelValue', 39.76);
      await nextTick();

      await wrapper.find('[data-testid="btn-calculate-k"]').trigger('click');
      await flushPromises();

      expect(mockCalculateK).not.toHaveBeenCalled();
    });

    it('guard: não chama calculateK se kY for null', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'calculateK');
      await nextTick();

      // Só kAttribute preenchido, kY permanece null
      const inputs = wrapper.findAllComponents({ name: 'QInput' });
      await inputs[0]!.vm.$emit('update:modelValue', 10);
      await nextTick();

      await wrapper.find('[data-testid="btn-calculate-k"]').trigger('click');
      await flushPromises();

      expect(mockCalculateK).not.toHaveBeenCalled();
    });
  });

  // ── Tab damageBonus ────────────────────────────────────────────────────────

  describe('Tab damageBonus', () => {
    it('botão chama calculateDamageBonus com o valor do input', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'damageBonus');
      await nextTick();

      // Na tab damageBonus, há apenas um QInput: inputs[0]=fr
      const inputs = wrapper.findAllComponents({ name: 'QInput' });
      await inputs[0]!.vm.$emit('update:modelValue', 15);
      await nextTick();

      await wrapper.find('[data-testid="btn-calculate-damage-bonus"]').trigger('click');
      await flushPromises();

      expect(mockCalculateDamageBonus).toHaveBeenCalledWith(15);
    });

    it('guard: não chama calculateDamageBonus se fr for null', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'damageBonus');
      await nextTick();

      // fr permanece null
      await wrapper.find('[data-testid="btn-calculate-damage-bonus"]').trigger('click');
      await flushPromises();

      expect(mockCalculateDamageBonus).not.toHaveBeenCalled();
    });
  });

  // ── Resultado ─────────────────────────────────────────────────────────────

  describe('Resultado', () => {
    it('data-testid="capacity-result" não visível quando result é null', () => {
      mockResult.value = null;
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="capacity-result"]').exists()).toBe(false);
    });

    it('data-testid="capacity-result" visível quando result não é null', async () => {
      mockResult.value = { value: 39.76 };
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.find('[data-testid="capacity-result"]').exists()).toBe(true);
    });

    it('data-testid="result-value" exibe o valor de result.value', async () => {
      mockResult.value = { value: 39.76 };
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.find('[data-testid="result-value"]').text()).toBe('39.76');
    });
  });

  // ── Erro ──────────────────────────────────────────────────────────────────

  describe('Erro', () => {
    it('data-testid="capacity-error" não visível quando error é null', () => {
      mockError.value = null;
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="capacity-error"]').exists()).toBe(false);
    });

    it('data-testid="capacity-error" visível quando error não é null', async () => {
      mockError.value = 'Erro ao calcular Y';
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.find('[data-testid="capacity-error"]').exists()).toBe(true);
    });
  });

  // ── Loading ───────────────────────────────────────────────────────────────

  describe('Loading', () => {
    it('botão btn-calculate-y recebe :loading reativo', async () => {
      mockLoading.value = true;
      const wrapper = mountPage();
      await nextTick();

      const btn = wrapper.findAllComponents({ name: 'QBtn' }).find(
        (b) => b.attributes('data-testid') === 'btn-calculate-y',
      );
      expect(btn).toBeDefined();
      expect(btn!.props('loading')).toBe(true);
    });

    it('loading false: botão não está em estado de carregamento', async () => {
      mockLoading.value = false;
      const wrapper = mountPage();
      await nextTick();

      const btn = wrapper.findAllComponents({ name: 'QBtn' }).find(
        (b) => b.attributes('data-testid') === 'btn-calculate-y',
      );
      expect(btn!.props('loading')).toBe(false);
    });
  });
});
