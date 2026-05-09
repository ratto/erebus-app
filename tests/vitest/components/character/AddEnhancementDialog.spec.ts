import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, h } from 'vue';
import { createI18n } from 'vue-i18n';
import ptBR from 'src/i18n/pt-BR';
import AddEnhancementDialog from 'src/components/character/AddEnhancementDialog.vue';

const i18n = createI18n({
  locale: 'pt-BR',
  legacy: false,
  messages: { 'pt-BR': ptBR },
});

interface EnhancementOption {
  id: number;
  nome: string;
  custo: number;
}

const enhancementOptions: EnhancementOption[] = [
  { id: 1, nome: 'Riqueza', custo: 5 },
  { id: 2, nome: 'Dívida', custo: -3 },
  { id: 3, nome: 'Neutro', custo: 0 },
];

/**
 * QSelect stub que renderiza o slot #option para cada opção da lista,
 * permitindo inspecionar a coloração de custo sem depender do QSelect real.
 */
const QSelectWithOptionSlotStub = {
  template: `<div class="q-select-stub">
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', parseValue($event.target.value))"
    >
      <option v-for="opt in options" :key="opt.id" :value="opt.id">{{ opt.nome }}</option>
    </select>
    <div class="q-select-options">
      <slot
        v-for="opt in options"
        name="option"
        :opt="opt"
        :itemProps="{ key: opt.id }"
      />
    </div>
  </div>`,
  props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'emitValue', 'mapOptions'],
  emits: ['update:modelValue'],
  methods: {
    parseValue(val: string) {
      const num = Number(val);
      return isNaN(num) ? val : num;
    },
  },
};

const QBtnStub = {
  template: '<button @click="$emit(\'click\')" :disabled="disable"><slot /></button>',
  props: ['disable', 'label', 'flat', 'class'],
  emits: ['click'],
};

function mountDialog(options: EnhancementOption[] = enhancementOptions) {
  return mount(AddEnhancementDialog, {
    props: {
      modelValue: true,
      enhancementOptions: options,
    },
    global: {
      plugins: [i18n],
      stubs: {
        QDialog: { template: '<div><slot /></div>' },
        QCard: { template: '<div class="q-card"><slot /></div>' },
        QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
        QCardActions: { template: '<div class="q-card-actions"><slot /></div>' },
        QSelect: QSelectWithOptionSlotStub,
        QBtn: QBtnStub,
        QItem: { template: '<div class="q-item" v-bind="$attrs"><slot /></div>' },
        QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
        QItemLabel: { template: '<div class="q-item-label"><slot /></div>' },
      },
    },
  });
}

describe('AddEnhancementDialog.vue', () => {
  it('renderiza com modelValue=true', () => {
    const wrapper = mountDialog();
    expect(wrapper.exists()).toBe(true);
  });

  it('botão Confirmar está desabilitado sem aprimoramento selecionado', () => {
    const wrapper = mountDialog();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    expect(confirmBtn.attributes('disabled')).toBeDefined();
  });

  it('botão Confirmar está habilitado após seleção', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as { selectedEnhancement: EnhancementOption | null };
    vm.selectedEnhancement = enhancementOptions[0]!;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    expect(confirmBtn.attributes('disabled')).toBeUndefined();
  });

  it('emite add com CharacterEnhancement correto', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as { selectedEnhancement: EnhancementOption | null };
    vm.selectedEnhancement = { id: 1, nome: 'Riqueza', custo: 5 };
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    await confirmBtn.trigger('click');
    const emitted = wrapper.emitted('add');
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual([{ id: 1, nome: 'Riqueza', custo: 5 }]);
  });

  it('emite update:modelValue=false após confirmação', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as { selectedEnhancement: EnhancementOption | null };
    vm.selectedEnhancement = { id: 1, nome: 'Riqueza', custo: 5 };
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    await confirmBtn.trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    const lastEmit = emitted![emitted!.length - 1];
    expect(lastEmit).toEqual([false]);
  });

  it('estado reseta após confirmação (selectedEnhancement volta a null)', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as { selectedEnhancement: EnhancementOption | null };
    vm.selectedEnhancement = { id: 2, nome: 'Dívida', custo: -3 };
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    await confirmBtn.trigger('click');
    await nextTick();
    expect(vm.selectedEnhancement).toBeNull();
  });

  it('cancelar emite update:modelValue=false', async () => {
    const wrapper = mountDialog();
    const buttons = wrapper.findAll('button');
    const cancelBtn = buttons[0]!;
    await cancelBtn.trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual([false]);
  });

  it('custo positivo (custo=5) usa classe text-positive no slot #option', () => {
    const wrapper = mountDialog();
    // O stub QSelectWithOptionSlotStub renderiza o slot #option para cada opção
    // A opção "Riqueza" (custo=5) deve ter span.text-positive
    const positiveSpans = wrapper.findAll('.text-positive');
    expect(positiveSpans.length).toBeGreaterThan(0);
  });

  it('custo negativo (custo=-3) usa classe text-negative no slot #option', () => {
    const wrapper = mountDialog();
    const negativeSpans = wrapper.findAll('.text-negative');
    expect(negativeSpans.length).toBeGreaterThan(0);
    // Verifica que o span com text-negative contém o valor de Dívida (-3)
    const negativeTexts = negativeSpans.map((s) => s.text());
    expect(negativeTexts.some((t) => t.includes('-3'))).toBe(true);
  });

  it('custo zero (custo=0) usa classe text-positive no slot #option', () => {
    const wrapper = mountDialog();
    // O item "Neutro" tem custo=0, que é >= 0, então usa text-positive
    const positiveSpans = wrapper.findAll('.text-positive');
    // Deve haver pelo menos dois elementos text-positive: Riqueza (5) e Neutro (0)
    expect(positiveSpans.length).toBeGreaterThanOrEqual(2);
    const texts = positiveSpans.map((s) => s.text());
    expect(texts.some((t) => t.includes('0'))).toBe(true);
  });

  it('custo positivo exibe sinal de + no texto do slot #option', () => {
    const wrapper = mountDialog();
    const positiveSpans = wrapper.findAll('.text-positive');
    const withPlus = positiveSpans.filter((s) => s.text().includes('+'));
    expect(withPlus.length).toBeGreaterThan(0);
  });
});
