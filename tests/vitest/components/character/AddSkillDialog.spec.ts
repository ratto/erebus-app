import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AddSkillDialog from 'src/components/character/AddSkillDialog.vue';

const QSelectStub = {
  template: `<select
    :value="modelValue"
    @change="$emit('update:modelValue', parseSelectValue($event.target.value))"
  >
    <option v-for="opt in options" :key="opt.id" :value="opt.id">
      {{ opt.nome }}
    </option>
  </select>`,
  props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'emitValue', 'mapOptions'],
  emits: ['update:modelValue'],
  methods: {
    parseSelectValue(val: string) {
      const num = Number(val);
      return isNaN(num) ? val : num;
    },
  },
};

const QInputStub = {
  template: `<input
    type="number"
    :value="modelValue"
    @input="$emit('update:modelValue', Number($event.target.value))"
  />`,
  props: ['modelValue', 'type', 'label', 'min', 'max', 'dense', 'outlined'],
  emits: ['update:modelValue'],
};

const QBtnStub = {
  template: '<button @click="$emit(\'click\')" :disabled="disable"><slot /></button>',
  props: ['disable', 'label', 'flat', 'class'],
  emits: ['click'],
};

const skillOptions = [
  { id: 1, nome: 'Espada' },
  { id: 2, nome: 'Arco' },
];

function mountDialog(props: { modelValue?: boolean; skillOptions?: typeof skillOptions } = {}) {
  return mount(AddSkillDialog, {
    props: {
      modelValue: true,
      skillOptions,
      ...props,
    },
    global: {
      plugins: [],
      stubs: {
        QDialog: { template: '<div><slot /></div>' },
        QCard: { template: '<div class="q-card"><slot /></div>' },
        QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
        QCardActions: { template: '<div class="q-card-actions"><slot /></div>' },
        QSelect: QSelectStub,
        QInput: QInputStub,
        QBtn: QBtnStub,
      },
    },
  });
}

describe('AddSkillDialog.vue', () => {
  it('renderiza com modelValue=true e skillOptions', () => {
    const wrapper = mountDialog();
    expect(wrapper.exists()).toBe(true);
  });

  it('QSelect exibe as opções de perícia', () => {
    const wrapper = mountDialog();
    const options = wrapper.findAll('option');
    expect(options).toHaveLength(skillOptions.length);
    expect(options[0]!.text()).toContain('Espada');
    expect(options[1]!.text()).toContain('Arco');
  });

  it('botão Confirmar está desabilitado sem perícia selecionada', () => {
    const wrapper = mountDialog();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    expect(confirmBtn.attributes('disabled')).toBeDefined();
  });

  it('botão Confirmar está desabilitado com points abaixo do mínimo (< 10)', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkill: { id: number; nome: string } | null;
      points: number;
    };
    vm.selectedSkill = { id: 1, nome: 'Espada' };
    vm.points = 9;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    expect(confirmBtn.attributes('disabled')).toBeDefined();
  });

  it('botão Confirmar está desabilitado com points acima do máximo (> 50)', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkill: { id: number; nome: string } | null;
      points: number;
    };
    vm.selectedSkill = { id: 1, nome: 'Espada' };
    vm.points = 51;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    expect(confirmBtn.attributes('disabled')).toBeDefined();
  });

  it('botão Confirmar está habilitado com seleção válida e points no range', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkill: { id: number; nome: string } | null;
      points: number;
    };
    vm.selectedSkill = { id: 1, nome: 'Espada' };
    vm.points = 20;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    expect(confirmBtn.attributes('disabled')).toBeUndefined();
  });

  it('emite add com CharacterSkill correto ao confirmar', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkill: { id: number; nome: string } | null;
      points: number;
    };
    vm.selectedSkill = { id: 1, nome: 'Espada' };
    vm.points = 20;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    await confirmBtn.trigger('click');
    const emitted = wrapper.emitted('add');
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual([{ id: 1, nome: 'Espada', pontos: 20 }]);
  });

  it('emite update:modelValue=false após confirmação', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkill: { id: number; nome: string } | null;
      points: number;
    };
    vm.selectedSkill = { id: 2, nome: 'Arco' };
    vm.points = 30;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    await confirmBtn.trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    const lastEmit = emitted![emitted!.length - 1];
    expect(lastEmit).toEqual([false]);
  });

  it('estado reseta após confirmação (selectedSkill=null, points=10)', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkill: { id: number; nome: string } | null;
      points: number;
    };
    vm.selectedSkill = { id: 1, nome: 'Espada' };
    vm.points = 25;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    await confirmBtn.trigger('click');
    await nextTick();
    expect(vm.selectedSkill).toBeNull();
    expect(vm.points).toBe(10);
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
});
