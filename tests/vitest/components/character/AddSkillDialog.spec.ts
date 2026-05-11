import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AddSkillDialog from 'src/components/character/AddSkillDialog.vue';

/**
 * Após a migração para ErebusDialog, o componente usa ErebusDialog como wrapper.
 * Os botões agora usam data-testid="btn-cancel" e data-testid="btn-confirm"
 * do ErebusDialog. O stub de QDialog permanece necessário (interno ao ErebusDialog).
 *
 * A seleção de perícia passou a usar ErebusSelect (v-model com id da perícia).
 * Para os testes de habilitação/desabilitação do botão, manipulamos selectedSkillId
 * diretamente via vm.
 */
const QInputStub = {
  template: `<input
    type="number"
    :value="modelValue"
    @input="$emit('update:modelValue', Number($event.target.value))"
  />`,
  props: ['modelValue', 'type', 'label', 'min', 'max', 'dense', 'outlined', 'dataTestid'],
  emits: ['update:modelValue'],
};

const QBtnStub = {
  template: '<button @click="$emit(\'click\')" :disabled="disable" :data-testid="dataTestid"><slot /></button>',
  props: ['disable', 'label', 'flat', 'dataTestid'],
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
        QInput: QInputStub,
        QBtn: QBtnStub,
        QSelect: {
          template: `<select
            :value="modelValue"
            @change="$emit('update:modelValue', Number($event.target.value))"
          >
            <option v-for="opt in options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>`,
          props: ['modelValue', 'options'],
          emits: ['update:modelValue'],
        },
      },
    },
  });
}

describe('AddSkillDialog.vue', () => {
  it('renderiza com modelValue=true e skillOptions', () => {
    const wrapper = mountDialog();
    expect(wrapper.exists()).toBe(true);
  });

  it('ErebusSelect/QSelect exibe as opções de perícia', () => {
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
    const vm = wrapper.vm as unknown as { selectedSkillId: number | null; points: number };
    vm.selectedSkillId = 1;
    vm.points = 9;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    expect(confirmBtn.attributes('disabled')).toBeDefined();
  });

  it('botão Confirmar está desabilitado com points acima do máximo (> 50)', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as { selectedSkillId: number | null; points: number };
    vm.selectedSkillId = 1;
    vm.points = 51;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    expect(confirmBtn.attributes('disabled')).toBeDefined();
  });

  it('botão Confirmar está habilitado com seleção válida e points no range', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as { selectedSkillId: number | null; points: number };
    vm.selectedSkillId = 1;
    vm.points = 20;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    expect(confirmBtn.attributes('disabled')).toBeUndefined();
  });

  it('emite add com CharacterSkill correto ao confirmar', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as { selectedSkillId: number | null; points: number };
    vm.selectedSkillId = 1;
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
    const vm = wrapper.vm as unknown as { selectedSkillId: number | null; points: number };
    vm.selectedSkillId = 2;
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

  it('estado reseta após confirmação (selectedSkillId=null, points=10)', async () => {
    const wrapper = mountDialog();
    const vm = wrapper.vm as unknown as { selectedSkillId: number | null; points: number };
    vm.selectedSkillId = 1;
    vm.points = 25;
    await nextTick();
    const buttons = wrapper.findAll('button');
    const confirmBtn = buttons[buttons.length - 1]!;
    await confirmBtn.trigger('click');
    await nextTick();
    expect(vm.selectedSkillId).toBeNull();
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
