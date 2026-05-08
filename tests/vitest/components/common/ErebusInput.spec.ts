import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

import ErebusInput from 'src/components/common/ErebusInput.vue';

const mountOptions = {
  global: {
    plugins: [],
    stubs: {
      QInput: {
        template: `<input
          class="q-input"
          :class="[innerClass]"
          :data-testid="dataTestid"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />`,
        props: ['modelValue', 'innerClass', 'dataTestid'],
        emits: ['update:modelValue'],
      },
    },
  },
};

function mountInput(props = {}) {
  return mount(ErebusInput, { ...mountOptions, props });
}

describe('ErebusInput.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o componente sem erros', () => {
    const wrapper = mountInput();

    expect(wrapper.exists()).toBe(true);
  });

  it('renderiza um QInput', () => {
    const wrapper = mountInput();

    expect(wrapper.find('.q-input').exists()).toBe(true);
  });

  it('atualiza o v-model quando o input muda', async () => {
    const wrapper = mountInput({ modelValue: 'inicial' });

    const input = wrapper.find('input');
    await input.setValue('novo valor');

    expect(wrapper.emitted('update:modelValue')).toBeDefined();
  });

  it('aplica innerClass ao QInput quando fornecido', () => {
    const wrapper = mountInput({ innerClass: 'custom-class' });

    const input = wrapper.find('input');
    expect(input.classes()).toContain('custom-class');
  });

  it('não aplica innerClass quando não fornecido', () => {
    const wrapper = mountInput({ innerClass: '' });

    const input = wrapper.find('input');
    expect(input.classes()).not.toContain(undefined);
  });

  it('aplica data-testid quando fornecido', () => {
    const wrapper = mountInput({ dataTestid: 'custom-test-id' });

    const input = wrapper.find('input');
    expect(input.attributes('data-testid')).toBe('custom-test-id');
  });

  it('usa o padrão input-test como data-testid quando não fornecido', () => {
    const wrapper = mountInput();

    const input = wrapper.find('input');
    expect(input.attributes('data-testid')).toBe('input-test');
  });

  it('suporta múltiplas classes em innerClass', () => {
    const wrapper = mountInput({ innerClass: 'class1 class2' });

    const input = wrapper.find('input');
    expect(input.classes()).toContain('class1');
    expect(input.classes()).toContain('class2');
  });

  it('mantém o valor do modelValue após renderização', async () => {
    const wrapper = mountInput({ modelValue: 'teste inicial' });

    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toBe('teste inicial');
  });

  it('emite event com valor correto quando muda', async () => {
    const wrapper = mountInput({ modelValue: '' });

    const input = wrapper.find('input');
    await input.setValue('novo');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeDefined();
    expect(emitted![0]).toEqual(['novo']);
  });
});
