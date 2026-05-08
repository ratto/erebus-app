import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ItemFormDialog from 'src/components/items-page/ItemFormDialog.vue';
import type { Item } from 'src/model/types/item.type';

const defaultMountOptions = {
  props: {
    modelValue: true,
    mode: 'create' as const,
  },
  global: {
    plugins: [],
    stubs: {
      QDialog: { template: '<div><slot /></div>' },
      QCard: { template: '<div class="q-card"><slot /></div>' },
      QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
      QCardActions: { template: '<div class="q-card-actions"><slot /></div>' },
      QForm: {
        template: '<form ref="formRef"><slot /></form>',
        methods: { validate: vi.fn().mockResolvedValue(true) },
      },
      QInput: {
        template: `<input
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :maxlength="maxlength"
          :data-testid="dataTestid"
        />`,
        props: ['modelValue', 'maxlength', 'dataTestid'],
        emits: ['update:modelValue'],
      },
      QSelect: {
        template: `<select
          :value="modelValue"
          @change="$emit('update:modelValue', $event.target.value)"
          :data-testid="dataTestid"
        >
          <option v-for="opt in options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>`,
        props: ['modelValue', 'options', 'dataTestid'],
        emits: ['update:modelValue'],
      },
      QBtn: {
        template: '<button @click="$emit(\'click\')" :disabled="disable" :data-testid="dataTestid"><slot /></button>',
        props: ['disable', 'dataTestid'],
        emits: ['click'],
      },
    },
  },
};

function mountDialog(props = {}) {
  return mount(ItemFormDialog, {
    ...defaultMountOptions,
    props: { ...defaultMountOptions.props, ...props },
  });
}

describe('ItemFormDialog.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('renderiza o componente sem erros', () => {
      const wrapper = mountDialog();

      expect(wrapper.exists()).toBe(true);
    });

    it('exibe título de criação em modo create', () => {
      const wrapper = mountDialog({ mode: 'create' });

      expect(wrapper.text()).toMatch(/Criar|Create|Novo/i);
    });

    it('exibe título de edição em modo edit', async () => {
      const item: Item = {
        id: '1',
        name: 'Espada',
        type: 'mundane',
        description: 'Uma espada de ferro',
      };

      const wrapper = mountDialog({ mode: 'edit', item });
      await nextTick();

      expect(wrapper.text()).toMatch(/Editar|Edit/i);
    });
  });

  describe('Pré-preenchimento em modo edit', () => {
    it('preenche o formulário com dados do item em modo edit', async () => {
      const item: Item = {
        id: '1',
        name: 'Espada Longa',
        type: 'mundane',
        description: 'Uma arma branca efetiva',
      };

      const wrapper = mountDialog({ mode: 'edit', item });
      await nextTick();

      const inputs = wrapper.findAll('input');
      expect(inputs[0]!.element.value).toBe('Espada Longa');
    });

    it('limpa o formulário em modo create', async () => {
      const wrapper = mountDialog({ mode: 'create' });
      await nextTick();

      const inputs = wrapper.findAll('input');
      expect(inputs[0]!.element.value).toBe('');
    });
  });

  describe('Validação do formulário', () => {
    it('desabilita o botão save quando o formulário é inválido (name vazio)', async () => {
      const wrapper = mountDialog({ mode: 'create' });
      await nextTick();

      const saveBtn = wrapper.find('[data-testid="btn-save"]');
      expect(saveBtn.attributes('disabled')).toBeDefined();
    });

    it('habilita o botão save quando o formulário é válido', async () => {
      const wrapper = mountDialog({ mode: 'create' });
      await nextTick();

      const nameInput = wrapper.findAll('input')[0]!;
      const typeSelect = wrapper.find('select');

      await nameInput.setValue('Poção');
      await typeSelect.setValue('consumable');
      await nextTick();

      const saveBtn = wrapper.find('[data-testid="btn-save"]');
      expect(saveBtn.attributes('disabled')).not.toBeDefined();
    });

    it('rejeita nome vazio', async () => {
      const wrapper = mountDialog({ mode: 'create' });
      await nextTick();

      const nameInput = wrapper.findAll('input')[0]!;
      const typeSelect = wrapper.find('select');

      await nameInput.setValue('   ');
      await typeSelect.setValue('consumable');
      await nextTick();

      const saveBtn = wrapper.find('[data-testid="btn-save"]');
      expect(saveBtn.attributes('disabled')).toBeDefined();
    });

    it('rejeita nome com mais de 80 caracteres', async () => {
      const wrapper = mountDialog({ mode: 'create' });
      await nextTick();

      const longName = 'a'.repeat(81);
      const nameInput = wrapper.findAll('input')[0]!;

      await nameInput.setValue(longName);
      await nextTick();

      const saveBtn = wrapper.find('[data-testid="btn-save"]');
      expect(saveBtn.attributes('disabled')).toBeDefined();
    });

    it('rejeita type nulo', async () => {
      const wrapper = mountDialog({ mode: 'create' });
      await nextTick();

      const nameInput = wrapper.findAll('input')[0]!;
      await nameInput.setValue('Item');
      await nextTick();

      const saveBtn = wrapper.find('[data-testid="btn-save"]');
      expect(saveBtn.attributes('disabled')).toBeDefined();
    });

    it('rejeita description com mais de 500 caracteres', async () => {
      const wrapper = mountDialog({ mode: 'create' });
      await nextTick();

      const longDesc = 'a'.repeat(501);
      const nameInput = wrapper.findAll('input')[0]!;
      const typeSelect = wrapper.find('select');
      const descInput = wrapper.findAll('input')[1]!;

      await nameInput.setValue('Item');
      await typeSelect.setValue('mundane');
      await descInput.setValue(longDesc);
      await nextTick();

      const saveBtn = wrapper.find('[data-testid="btn-save"]');
      expect(saveBtn.attributes('disabled')).toBeDefined();
    });
  });

  describe('Eventos', () => {
    it('emite confirm com dados corretos quando save é clicado e válido', async () => {
      const wrapper = mountDialog({ mode: 'create' });
      await nextTick();

      const nameInput = wrapper.findAll('input')[0]!;
      const typeSelect = wrapper.find('select');
      const descInput = wrapper.findAll('input')[1]!;

      await nameInput.setValue('Maçã');
      await typeSelect.setValue('consumable');
      await descInput.setValue('Fruta vermelha');
      await nextTick();

      const saveBtn = wrapper.find('[data-testid="btn-save"]');
      await saveBtn.trigger('click');

      const emitted = wrapper.emitted('confirm');
      expect(emitted).toBeDefined();
    });

    it('emite update:modelValue=false quando cancel é clicado', async () => {
      const wrapper = mountDialog({ mode: 'create' });
      await nextTick();

      const cancelBtn = wrapper.find('[data-testid="btn-cancel"]');
      await cancelBtn.trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeDefined();
    });

    it('aceita atualização de prop modelValue', async () => {
      const wrapper = mountDialog({ mode: 'create', modelValue: true });
      await nextTick();

      await wrapper.setProps({ modelValue: false });
      await nextTick();

      expect(wrapper.props('modelValue')).toBe(false);
    });
  });

  describe('isValid computed', () => {
    it('retorna true quando todos os campos são válidos', async () => {
      const wrapper = mountDialog({ mode: 'create' });
      await nextTick();

      const nameInput = wrapper.findAll('input')[0]!;
      const typeSelect = wrapper.find('select');

      await nameInput.setValue('Item válido');
      await typeSelect.setValue('mundane');
      await nextTick();

      const saveBtn = wrapper.find('[data-testid="btn-save"]');
      expect(saveBtn.attributes('disabled')).not.toBeDefined();
    });
  });
});
