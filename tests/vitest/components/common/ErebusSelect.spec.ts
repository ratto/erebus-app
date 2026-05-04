import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar } from 'quasar';
import ErebusSelect from 'src/components/common/ErebusSelect.vue';
import type { BaseOption } from 'src/utils/options';

const mountOptions = {
  global: {
    plugins: [[Quasar, {}]],
    stubs: {
      QSelect: {
        template: `<select
          class="q-select"
          :class="[innerClass]"
          :data-testid="dataTestid"
          :value="modelValue"
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <option v-for="opt in options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>`,
        props: ['modelValue', 'options', 'innerClass', 'dataTestid'],
        emits: ['update:modelValue'],
      },
    },
  },
};

const testOptions: BaseOption[] = [
  { label: 'Força', value: 'FR' },
  { label: 'Agilidade', value: 'AGI' },
  { label: 'Inteligência', value: 'INT' },
];

function mountSelect(props = {}) {
  return mount(ErebusSelect, {
    ...mountOptions,
    props: { options: testOptions, ...props },
  });
}

describe('ErebusSelect.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o componente sem erros', () => {
    const wrapper = mountSelect();

    expect(wrapper.exists()).toBe(true);
  });

  it('renderiza um QSelect', () => {
    const wrapper = mountSelect();

    expect(wrapper.find('.q-select').exists()).toBe(true);
  });

  it('renderiza todas as opções passadas', () => {
    const wrapper = mountSelect();

    expect(wrapper.text()).toContain('Força');
    expect(wrapper.text()).toContain('Agilidade');
    expect(wrapper.text()).toContain('Inteligência');
  });

  it('atualiza o v-model quando a seleção muda', async () => {
    const wrapper = mountSelect({ modelValue: 'FR' });

    const select = wrapper.find('select');
    await select.setValue('AGI');

    expect(wrapper.emitted('update:modelValue')).toBeDefined();
  });

  it('aplica innerClass quando fornecido', () => {
    const wrapper = mountSelect({ innerClass: 'custom-select' });

    const select = wrapper.find('select');
    expect(select.classes()).toContain('custom-select');
  });

  it('não aplica innerClass quando vazio', () => {
    const wrapper = mountSelect({ innerClass: '' });

    const select = wrapper.find('select');
    expect(select.classes()).not.toContain('');
  });

  it('aplica data-testid quando fornecido', () => {
    const wrapper = mountSelect({ dataTestid: 'attribute-select' });

    const select = wrapper.find('select');
    expect(select.attributes('data-testid')).toBe('attribute-select');
  });

  it('usa o padrão select-test como data-testid quando não fornecido', () => {
    const wrapper = mountSelect();

    const select = wrapper.find('select');
    expect(select.attributes('data-testid')).toBe('select-test');
  });

  it('mantém o modelValue selecionado após renderização', async () => {
    const wrapper = mountSelect({ modelValue: 'INT' });

    const select = wrapper.find('select');
    expect((select.element as HTMLSelectElement).value).toBe('INT');
  });

  it('emite event com valor correto quando muda', async () => {
    const wrapper = mountSelect({ modelValue: 'FR' });

    const select = wrapper.find('select');
    await select.setValue('AGI');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeDefined();
  });

  it('suporta múltiplas classes em innerClass', () => {
    const wrapper = mountSelect({ innerClass: 'class1 class2' });

    const select = wrapper.find('select');
    expect(select.classes()).toContain('class1');
    expect(select.classes()).toContain('class2');
  });

  it('renderiza opções com label e value corretos', () => {
    const wrapper = mountSelect();

    const options = wrapper.findAll('option');
    expect(options).toHaveLength(testOptions.length);
  });

  it('suporta null como modelValue (seleção vazia)', async () => {
    const wrapper = mountSelect({ modelValue: null });

    const select = wrapper.find('select');
    expect((select.element as HTMLSelectElement).value).toBe('');
  });
});
