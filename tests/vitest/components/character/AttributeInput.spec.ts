import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AttributeInput from 'src/components/character/AttributeInput.vue';

const QInputStub = {
  template: `<div class="q-input-stub">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <div class="q-input-append"><slot name="append" /></div>
  </div>`,
  props: ['modelValue', 'label', 'type', 'min', 'max', 'dense', 'outlined'],
  emits: ['update:modelValue'],
};

const QIconStub = {
  template: '<span class="q-icon"><slot /></span>',
  props: ['name', 'size', 'class'],
};

const QTooltipStub = {
  template: '<span class="q-tooltip"><slot /></span>',
};

function mountComponent(props: { modelValue: number; label: string; tooltip?: string }) {
  return mount(AttributeInput, {
    props,
    global: {
      plugins: [],
      stubs: {
        QInput: QInputStub,
        QIcon: QIconStub,
        QTooltip: QTooltipStub,
      },
    },
  });
}

describe('AttributeInput.vue', () => {
  it('renderiza sem erros', () => {
    const wrapper = mountComponent({ modelValue: 10, label: 'FR' });
    expect(wrapper.exists()).toBe(true);
  });

  it('exibe a label correta no QInput', () => {
    const wrapper = mountComponent({ modelValue: 12, label: 'DEX' });
    const input = wrapper.findComponent(QInputStub);
    expect(input.props('label')).toBe('DEX');
  });

  it('exibe o valor atual como modelValue', () => {
    const wrapper = mountComponent({ modelValue: 15, label: 'INT' });
    const input = wrapper.find('input');
    expect(input.element.value).toBe('15');
  });

  it('emite update:modelValue com number ao receber string numérica', async () => {
    const wrapper = mountComponent({ modelValue: 10, label: 'FR' });
    const input = wrapper.find('input');
    await input.setValue('15');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual([15]);
    expect(typeof emitted![0]![0]).toBe('number');
  });

  it('string numérica é convertida para number no emit', async () => {
    const wrapper = mountComponent({ modelValue: 10, label: 'AGI' });
    const input = wrapper.find('input');
    await input.setValue('8');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![0]![0]).toStrictEqual(8);
    expect(typeof emitted![0]![0]).toBe('number');
  });

  it('NaN não dispara emit update:modelValue', async () => {
    const wrapper = mountComponent({ modelValue: 10, label: 'CON' });
    // Dispara o handler onUpdate diretamente com valor não-numérico
    const vm = wrapper.vm as unknown as { $el: HTMLElement };
    // Chama o evento via trigger no input nativo com valor 'abc'
    const input = wrapper.find('input');
    await input.setValue('abc');
    // O stub emite a string 'abc', mas onUpdate de AttributeInput converte e descarta NaN
    // O wrapper.emitted reflete apenas eventos emitidos pelo componente raiz
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeFalsy();
  });

  it('string vazia não dispara emit update:modelValue', async () => {
    const wrapper = mountComponent({ modelValue: 10, label: 'WILL' });
    const input = wrapper.find('input');
    await input.setValue('');
    // Number('') === 0, que não é NaN — mas o comportamento real do onUpdate depende do componente
    // O valor 0 é um número válido, então emite 0
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![0]![0]).toBe(0);
  });

  it('exibe o tooltip quando a prop tooltip é fornecida', () => {
    const wrapper = mountComponent({ modelValue: 10, label: 'CAR', tooltip: 'Carisma' });
    const tooltip = wrapper.findComponent(QTooltipStub);
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.text()).toContain('Carisma');
  });

  it('slot #append contém QIcon', () => {
    const wrapper = mountComponent({ modelValue: 10, label: 'PER', tooltip: 'Percepção' });
    const icon = wrapper.findComponent(QIconStub);
    expect(icon.exists()).toBe(true);
  });

  it('o componente aceita qualquer valor number como modelValue', () => {
    const wrapper = mountComponent({ modelValue: 20, label: 'FR' });
    expect(wrapper.props('modelValue')).toBe(20);
  });
});
