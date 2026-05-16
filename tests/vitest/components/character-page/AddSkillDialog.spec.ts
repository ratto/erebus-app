import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AddSkillDialog from 'src/components/character-page/AddSkillDialog.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const ErebusDialogStub = {
  template: `<div>
    <slot />
    <button data-testid="btn-cancel" @click="$emit('cancel'); $emit('update:modelValue', false)">{{ cancelLabel }}</button>
    <button data-testid="btn-confirm" :disabled="disableConfirm" @click="$emit('confirm')">{{ confirmLabel }}</button>
  </div>`,
  props: ['modelValue', 'title', 'confirmLabel', 'cancelLabel', 'disableConfirm', 'hideCancelButton', 'type', 'persistent'],
  emits: ['update:modelValue', 'confirm', 'cancel'],
};

const ErebusSelectStub = {
  template: `<select :value="modelValue" @change="$emit('update:modelValue', parseVal($event.target.value))">
    <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
  </select>`,
  props: ['modelValue', 'options', 'dataTestid', 'innerClass'],
  emits: ['update:modelValue'],
  methods: {
    parseVal(val: string) {
      const num = Number(val);
      return isNaN(num) ? val : num;
    },
  },
};

const QInputStub = {
  template: `<input type="number" :value="modelValue" @input="$emit('update:modelValue', Number($event.target.value))" />`,
  props: ['modelValue', 'type', 'label', 'min', 'max', 'dense', 'outlined'],
  emits: ['update:modelValue'],
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
        ErebusDialog: ErebusDialogStub,
        ErebusSelect: ErebusSelectStub,
        QInput: QInputStub,
      },
    },
  });
}

describe('AddSkillDialog.vue', () => {
  it('renderiza com modelValue=true e skillOptions', () => {
    const wrapper = mountDialog();
    expect(wrapper.exists()).toBe(true);
  });

  it('ErebusSelect exibe as opções de perícia', () => {
    const wrapper = mountDialog();
    const options = wrapper.findAll('option');
    expect(options).toHaveLength(skillOptions.length);
    expect(options[0]!.text()).toContain('Espada');
    expect(options[1]!.text()).toContain('Arco');
  });

  it('botão Confirmar está desabilitado sem perícia selecionada', () => {
    const wrapper = mountDialog();
    const confirmBtn = wrapper.find('[data-testid="btn-confirm"]');
    expect(confirmBtn.attributes('disabled')).toBeDefined();
  });

  it('botão Confirmar está desabilitado com points abaixo do mínimo (< 10)', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkillId: number | null;
      points: number;
    };
    vm.selectedSkillId = 1;
    vm.points = 9;
    await nextTick();
    const confirmBtn = wrapper.find('[data-testid="btn-confirm"]');
    expect(confirmBtn.attributes('disabled')).toBeDefined();
  });

  it('botão Confirmar está desabilitado com points acima do máximo (> 50)', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkillId: number | null;
      points: number;
    };
    vm.selectedSkillId = 1;
    vm.points = 51;
    await nextTick();
    const confirmBtn = wrapper.find('[data-testid="btn-confirm"]');
    expect(confirmBtn.attributes('disabled')).toBeDefined();
  });

  it('botão Confirmar está habilitado com seleção válida e points no range', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkillId: number | null;
      points: number;
    };
    vm.selectedSkillId = 1;
    vm.points = 20;
    await nextTick();
    const confirmBtn = wrapper.find('[data-testid="btn-confirm"]');
    expect(confirmBtn.attributes('disabled')).toBeUndefined();
  });

  it('emite add com CharacterSkill correto ao confirmar', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkillId: number | null;
      points: number;
    };
    vm.selectedSkillId = 1;
    vm.points = 20;
    await nextTick();
    const confirmBtn = wrapper.find('[data-testid="btn-confirm"]');
    await confirmBtn.trigger('click');
    const emitted = wrapper.emitted('add');
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual([{ id: 1, nome: 'Espada', pontos: 20 }]);
  });

  it('emite update:modelValue=false após confirmação', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkillId: number | null;
      points: number;
    };
    vm.selectedSkillId = 2;
    vm.points = 30;
    await nextTick();
    const confirmBtn = wrapper.find('[data-testid="btn-confirm"]');
    await confirmBtn.trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    const lastEmit = emitted![emitted!.length - 1];
    expect(lastEmit).toEqual([false]);
  });

  it('estado reseta após confirmação (selectedSkillId=null, points=10)', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as {
      selectedSkillId: number | null;
      points: number;
    };
    vm.selectedSkillId = 1;
    vm.points = 25;
    await nextTick();
    const confirmBtn = wrapper.find('[data-testid="btn-confirm"]');
    await confirmBtn.trigger('click');
    await nextTick();
    expect(vm.selectedSkillId).toBeNull();
    expect(vm.points).toBe(10);
  });

  it('cancelar emite update:modelValue=false', async () => {
    const wrapper = mountDialog();
    const cancelBtn = wrapper.find('[data-testid="btn-cancel"]');
    await cancelBtn.trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual([false]);
  });
});
