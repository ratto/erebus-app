import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Quasar } from 'quasar';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';

import type { CharacterSkill, CharacterEnhancement, CharacterValidationError } from 'src/model/types/character.type';

// mockNotify é usado para espiar chamadas a $q.notify na instância montada.
const mockNotify = vi.fn();

// ─── Mock do composable ───────────────────────────────────────────────────────

const {
  mockName,
  mockAge,
  mockLevel,
  mockAttributes,
  mockEnhancements,
  mockSkills,
  mockPv,
  mockIniciativa,
  mockAttributeBudget,
  mockAttributeBudgetUsed,
  mockAttributeBalance,
  mockEnhancementBalance,
  mockSkillBudget,
  mockSkillBudgetUsed,
  mockSkillBalance,
  mockCanSave,
  mockSubmit,
  mockReset,
} = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
  const { ref } = require('vue') as typeof import('vue');
  return {
    mockName: ref(''),
    mockAge: ref(25),
    mockLevel: ref(1),
    mockAttributes: ref({ FR: 10, DEX: 10, AGI: 10, CON: 10, INT: 10, WILL: 10, CAR: 10, PER: 10 }),
    mockEnhancements: ref<CharacterEnhancement[]>([]),
    mockSkills: ref<CharacterSkill[]>([]),
    mockPv: ref(0),
    mockIniciativa: ref(0),
    mockAttributeBudget: ref(111),
    mockAttributeBudgetUsed: ref(80),
    mockAttributeBalance: ref(31),
    mockEnhancementBalance: ref(0),
    mockSkillBudget: ref(0),
    mockSkillBudgetUsed: ref(0),
    mockSkillBalance: ref(0),
    mockCanSave: ref(false),
    mockSubmit: vi.fn().mockResolvedValue(true),
    mockReset: vi.fn(),
  };
});

vi.mock('src/composables/character.composable', () => ({
  useCharacterBuilder: () => ({
    name: mockName,
    age: mockAge,
    level: mockLevel,
    attributes: mockAttributes,
    enhancements: mockEnhancements,
    skills: mockSkills,
    pv: mockPv,
    iniciativa: mockIniciativa,
    attributeBudget: mockAttributeBudget,
    attributeBudgetUsed: mockAttributeBudgetUsed,
    attributeBalance: mockAttributeBalance,
    enhancementBalance: mockEnhancementBalance,
    skillBudget: mockSkillBudget,
    skillBudgetUsed: mockSkillBudgetUsed,
    skillBalance: mockSkillBalance,
    canSave: mockCanSave,
    submit: mockSubmit,
    reset: mockReset,
  }),
}));

import CharacterPage from '../../../src/pages/CharacterPage.vue';

// ─── Mount helper ─────────────────────────────────────────────────────────────

const i18nInstance = createI18n({ locale: 'pt-BR', legacy: false, messages });

// Stubs para componentes filhos que têm dependências próprias
const AddSkillDialogStub = {
  name: 'AddSkillDialog',
  template: '<div data-testid="add-skill-dialog" />',
  emits: ['add', 'update:modelValue'],
  props: ['modelValue', 'skillOptions'],
};

const AddEnhancementDialogStub = {
  name: 'AddEnhancementDialog',
  template: '<div data-testid="add-enhancement-dialog" />',
  emits: ['add', 'update:modelValue'],
  props: ['modelValue', 'enhancementOptions'],
};

const mountOptions = {
  global: {
    plugins: [[Quasar, {}], i18nInstance],
    stubs: {
      QPage: { template: '<div><slot /></div>' },
      AttributeInput: { template: '<div />', props: ['modelValue', 'label', 'tooltip'] },
      AddSkillDialog: AddSkillDialogStub,
      AddEnhancementDialog: AddEnhancementDialogStub,
      QTooltip: { template: '<div />' },
    },
  },
};

function mountPage() {
  return mount(CharacterPage, mountOptions);
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('CharacterPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockName.value = '';
    mockAge.value = 25;
    mockLevel.value = 1;
    mockAttributes.value = { FR: 10, DEX: 10, AGI: 10, CON: 10, INT: 10, WILL: 10, CAR: 10, PER: 10 };
    mockEnhancements.value = [];
    mockSkills.value = [];
    mockPv.value = 0;
    mockIniciativa.value = 0;
    mockAttributeBudget.value = 111;
    mockAttributeBudgetUsed.value = 80;
    mockAttributeBalance.value = 31;
    mockEnhancementBalance.value = 0;
    mockSkillBudget.value = 0;
    mockSkillBudgetUsed.value = 0;
    mockSkillBalance.value = 0;
    mockCanSave.value = false;
    mockSubmit.mockResolvedValue(true);
  });

  // ── Renderização ───────────────────────────────────────────────────────────

  describe('Renderização', () => {
    it('renderiza data-testid="character-container"', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="character-container"]').exists()).toBe(true);
    });

    it('exibe seção Dados Básicos', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Dados Básicos');
    });

    it('exibe seção Atributos', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Atributos');
    });

    it('exibe seção Valores Calculados', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Valores Calculados');
    });

    it('exibe seção Aprimoramentos', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Aprimoramentos');
    });

    it('exibe seção Perícias', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Perícias');
    });
  });

  // ── Badge de saldo de atributos ─────────────────────────────────────────────

  describe('Badge de saldo de atributos', () => {
    it('attributeBalance > 0 → badge com cor warning', async () => {
      mockAttributeBalance.value = 10;
      const wrapper = mountPage();
      await nextTick();

      const qBadge = wrapper
        .findAllComponents({ name: 'QBadge' })
        .find((b) => b.props('label') === 10);
      expect(qBadge).toBeDefined();
      expect(qBadge!.props('color')).toBe('warning');
    });

    it('attributeBalance = 0 → badge com cor positive', async () => {
      mockAttributeBalance.value = 0;
      const wrapper = mountPage();
      await nextTick();

      // Badge de atributo aparece no data-testid="attribute-balance"
      const badge = wrapper.find('[data-testid="attribute-balance"]');
      expect(badge.exists()).toBe(true);
      // O badge de balanço zero deve ter cor positive
      const qBadge = wrapper
        .findAllComponents({ name: 'QBadge' })
        .find((b) => b.props('label') === 0 && b.props('color') === 'positive');
      expect(qBadge).toBeDefined();
    });

    it('attributeBalance < 0 → badge com cor negative', async () => {
      mockAttributeBalance.value = -5;
      const wrapper = mountPage();
      await nextTick();

      const qBadge = wrapper
        .findAllComponents({ name: 'QBadge' })
        .find((b) => b.props('label') === -5);
      expect(qBadge).toBeDefined();
      expect(qBadge!.props('color')).toBe('negative');
    });
  });

  // ── Botão Salvar ───────────────────────────────────────────────────────────

  describe('Botão Salvar', () => {
    it('canSave=false → btn-save está desabilitado', async () => {
      mockCanSave.value = false;
      const wrapper = mountPage();
      await nextTick();

      const qBtn = wrapper.findAllComponents({ name: 'QBtn' }).find(
        (b) => b.attributes('data-testid') === 'btn-save',
      );
      expect(qBtn).toBeDefined();
      expect(qBtn!.props('disable')).toBe(true);
    });

    it('canSave=true → btn-save está habilitado', async () => {
      mockCanSave.value = true;
      const wrapper = mountPage();
      await nextTick();

      const qBtn = wrapper.findAllComponents({ name: 'QBtn' }).find(
        (b) => b.attributes('data-testid') === 'btn-save',
      );
      expect(qBtn!.props('disable')).toBe(false);
    });
  });

  // ── handleSubmit ───────────────────────────────────────────────────────────

  describe('handleSubmit', () => {
    // Estratégia: substituir $q.notify na instância do componente logo após a montagem.
    // O objeto $q do Quasar é compartilhado por referência — qualquer prop substituída
    // no objeto é vista pelo componente no momento da chamada.

    function injectNotifySpy(wrapper: ReturnType<typeof mountPage>): typeof mockNotify {
      const vm = wrapper.vm as InstanceType<typeof CharacterPage> & { $q: { notify: typeof mockNotify } };
      vm.$q.notify = mockNotify;
      return mockNotify;
    }

    it('submit() resolve true → $q.notify chamado com type="positive"', async () => {
      mockCanSave.value = true;
      mockSubmit.mockResolvedValue(true);
      const wrapper = mountPage();
      await nextTick();
      injectNotifySpy(wrapper);

      await wrapper.find('[data-testid="btn-save"]').trigger('click');
      await flushPromises();

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'positive' }),
      );
    });

    it('submit() resolve false → $q.notify chamado com type="negative"', async () => {
      mockCanSave.value = true;
      mockSubmit.mockResolvedValue(false);
      const wrapper = mountPage();
      await nextTick();
      injectNotifySpy(wrapper);

      await wrapper.find('[data-testid="btn-save"]').trigger('click');
      await flushPromises();

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'negative' }),
      );
    });

    it('submit() lança exceção → $q.notify chamado com type="negative"', async () => {
      mockCanSave.value = true;
      mockSubmit.mockRejectedValue(new Error('Falha de rede'));
      const wrapper = mountPage();
      await nextTick();
      injectNotifySpy(wrapper);

      await wrapper.find('[data-testid="btn-save"]').trigger('click');
      await flushPromises();

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'negative' }),
      );
    });
  });

  // ── handleReset ────────────────────────────────────────────────────────────

  describe('handleReset', () => {
    it('clicar em botão reset chama mockReset', async () => {
      const wrapper = mountPage();
      await nextTick();

      // Botão de reset tem icon="refresh"
      const resetBtn = wrapper
        .findAllComponents({ name: 'QBtn' })
        .find((b) => b.props('icon') === 'refresh');
      expect(resetBtn).toBeDefined();

      await resetBtn!.trigger('click');
      await nextTick();

      expect(mockReset).toHaveBeenCalledOnce();
    });

    it('clicar em botão reset zera validationErrors (banner some)', async () => {
      const wrapper = mountPage();
      const vm = wrapper.vm as InstanceType<typeof CharacterPage> & {
        validationErrors: CharacterValidationError[];
      };

      // Simular erros existentes
      vm.validationErrors = [{ code: 'ATTRIBUTE_BUDGET', message: 'erro' }];
      await nextTick();

      expect(wrapper.find('[data-testid="validation-errors"]').exists()).toBe(true);

      const resetBtn = wrapper
        .findAllComponents({ name: 'QBtn' })
        .find((b) => b.props('icon') === 'refresh');
      await resetBtn!.trigger('click');
      await nextTick();

      expect(wrapper.find('[data-testid="validation-errors"]').exists()).toBe(false);
    });
  });

  // ── addSkill / removeSkill ─────────────────────────────────────────────────

  describe('addSkill / removeSkill', () => {
    it('emitir add no AddSkillDialog stub adiciona skill à lista', async () => {
      const wrapper = mountPage();
      await nextTick();

      const dialog = wrapper.findComponent(AddSkillDialogStub);
      const newSkill: CharacterSkill = { id: 10, nome: 'Espada', pontos: 20 };
      await dialog.vm.$emit('add', newSkill);
      await nextTick();

      expect(mockSkills.value).toContainEqual(newSkill);
    });

    it('clicar em botão delete de uma skill remove o item correto por índice', async () => {
      mockSkills.value = [
        { id: 1, nome: 'Espada', pontos: 20 },
        { id: 2, nome: 'Corrida', pontos: 15 },
      ];
      const wrapper = mountPage();
      await nextTick();

      // Busca QBtns com icon="delete" — são os botões de remoção
      const qBtnsDelete = wrapper
        .findAllComponents({ name: 'QBtn' })
        .filter((b) => b.props('icon') === 'delete');

      // Os primeiros delete buttons são das enhancements (vazia) depois das skills
      // Como enhancements está vazia, os primeiros delete buttons são das skills
      expect(qBtnsDelete.length).toBeGreaterThanOrEqual(1);
      await qBtnsDelete[0]!.trigger('click');
      await nextTick();

      expect(mockSkills.value).toHaveLength(1);
      expect(mockSkills.value[0]!.nome).toBe('Corrida');
    });

    it('removeSkill remove pelo índice correto (segundo item)', async () => {
      mockSkills.value = [
        { id: 1, nome: 'Espada', pontos: 20 },
        { id: 2, nome: 'Corrida', pontos: 15 },
        { id: 3, nome: 'Magia', pontos: 30 },
      ];
      const wrapper = mountPage();
      await nextTick();

      const qBtnsDelete = wrapper
        .findAllComponents({ name: 'QBtn' })
        .filter((b) => b.props('icon') === 'delete');

      // Remove o segundo (índice 1 → Corrida)
      await qBtnsDelete[1]!.trigger('click');
      await nextTick();

      expect(mockSkills.value).toHaveLength(2);
      expect(mockSkills.value.map((s) => s.nome)).not.toContain('Corrida');
    });
  });

  // ── addEnhancement / removeEnhancement ────────────────────────────────────

  describe('addEnhancement / removeEnhancement', () => {
    it('emitir add no AddEnhancementDialog stub adiciona enhancement à lista', async () => {
      const wrapper = mountPage();
      await nextTick();

      const dialog = wrapper.findComponent(AddEnhancementDialogStub);
      const newEnh: CharacterEnhancement = { id: 10, nome: 'Ambidestria', custo: 3 };
      await dialog.vm.$emit('add', newEnh);
      await nextTick();

      expect(mockEnhancements.value).toContainEqual(newEnh);
    });

    it('clicar em botão delete de um enhancement remove o item correto', async () => {
      mockEnhancements.value = [
        { id: 1, nome: 'Ambidestria', custo: 3 },
        { id: 2, nome: 'Covarde', custo: -2 },
      ];
      mockSkills.value = []; // Sem skills para isolar os botões delete
      const wrapper = mountPage();
      await nextTick();

      const qBtnsDelete = wrapper
        .findAllComponents({ name: 'QBtn' })
        .filter((b) => b.props('icon') === 'delete');

      expect(qBtnsDelete.length).toBeGreaterThanOrEqual(1);
      await qBtnsDelete[0]!.trigger('click');
      await nextTick();

      expect(mockEnhancements.value).toHaveLength(1);
      expect(mockEnhancements.value[0]!.nome).toBe('Covarde');
    });
  });

  // ── Validation banner ──────────────────────────────────────────────────────

  describe('Validation banner', () => {
    it('validationErrors vazio → banner não visível', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="validation-errors"]').exists()).toBe(false);
    });

    it('validationErrors com erro → banner visível com texto traduzido', async () => {
      const wrapper = mountPage();
      await nextTick();

      const vm = wrapper.vm as InstanceType<typeof CharacterPage> & {
        validationErrors: CharacterValidationError[];
      };
      vm.validationErrors = [{ code: 'ATTRIBUTE_BUDGET', message: 'A soma dos atributos deve ser exatamente 111' }];
      await nextTick();

      const banner = wrapper.find('[data-testid="validation-errors"]');
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('A soma dos atributos deve ser exatamente 111');
    });
  });
});
