import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';

import type { CombatSkill } from 'src/model/types/combat-skill.type';

const { mockLoading, mockCombatSkills, mockGetAllCombatSkills } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
  const { ref } = require('vue') as typeof import('vue');
  return {
    mockLoading: ref(false),
    mockCombatSkills: ref<CombatSkill[]>([]),
    mockGetAllCombatSkills: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('src/composables/combat-skills.composable', () => ({
  useCombatSkills: () => ({
    loading: mockLoading,
    combatSkills: mockCombatSkills,
    getAllCombatSkills: mockGetAllCombatSkills,
  }),
}));

import CombatSkillsPage from '../../../src/pages/CombatSkillsPage.vue';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const combatSkillsFixture: CombatSkill[] = [
  {
    id: 1,
    nome: 'Luta',
    tipo: 'melee',
    atributoAtaque: 'FR',
    atributoDefesa: 'AGI',
    aprimoramentoRequerido: null,
    descricao: 'Combate corpo a corpo.',
  },
  {
    id: 2,
    nome: 'Arco',
    tipo: 'ranged',
    atributoAtaque: 'DEX',
    atributoDefesa: null,
    aprimoramentoRequerido: null,
    descricao: 'Disparo com arcos.',
  },
  {
    id: 3,
    nome: 'Escudo',
    tipo: 'shield',
    atributoAtaque: null,
    atributoDefesa: 'FR',
    aprimoramentoRequerido: 'Ambidestria',
    descricao: 'Uso defensivo de escudo.',
  },
];

// ─── Mount helper ─────────────────────────────────────────────────────────────

const mountOptions = {
  global: {
    stubs: {
      QPage: { template: '<div><slot /></div>' },
      ErebusInput: {
        template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        props: ['modelValue', 'label', 'placeholder', 'innerClass'],
        emits: ['update:modelValue'],
      },
      ErebusSelect: {
        template: `<select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
          <option v-for="opt in options" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
        </select>`,
        props: ['modelValue', 'options', 'label'],
        emits: ['update:modelValue'],
      },
    },
  },
};

function mountPage() {
  return mount(CombatSkillsPage, mountOptions);
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('CombatSkillsPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockCombatSkills.value = [];
  });

  // ── Inicialização ──────────────────────────────────────────────────────────

  describe('Inicialização', () => {
    it('chama getAllCombatSkills uma vez ao montar o componente', async () => {
      mountPage();
      await flushPromises();

      expect(mockGetAllCombatSkills).toHaveBeenCalledOnce();
    });

    it('renderiza a QTable', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'QTable' }).exists()).toBe(true);
    });
  });

  // ── Exibição ───────────────────────────────────────────────────────────────

  describe('Exibição', () => {
    beforeEach(() => {
      mockCombatSkills.value = combatSkillsFixture;
    });

    it('nome de cada skill aparece no DOM', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Luta');
      expect(text).toContain('Arco');
      expect(text).toContain('Escudo');
    });

    it('exibe "—" para campos nulos (atributoDefesa de Arco)', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).toContain('—');
    });

    it('renderiza um QBadge para o tipo de cada skill', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const badges = wrapper.findAllComponents({ name: 'QBadge' });
      expect(badges.length).toBeGreaterThanOrEqual(combatSkillsFixture.length);
    });
  });

  // ── Badge de tipo ──────────────────────────────────────────────────────────

  describe('Badge de tipo', () => {
    beforeEach(() => {
      mockCombatSkills.value = combatSkillsFixture;
    });

    it('tipoBadgeColor retorna "warning" para melee', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const meeleeBadge = wrapper.findAllComponents({ name: 'QBadge' }).find(
        (b) => b.props('color') === 'warning',
      );
      expect(meeleeBadge).toBeDefined();
    });

    it('tipoBadgeColor retorna "info" para ranged', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const rangedBadge = wrapper.findAllComponents({ name: 'QBadge' }).find(
        (b) => b.props('color') === 'info',
      );
      expect(rangedBadge).toBeDefined();
    });

    it('tipoBadgeColor retorna "secondary" para shield', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const shieldBadge = wrapper.findAllComponents({ name: 'QBadge' }).find(
        (b) => b.props('color') === 'secondary',
      );
      expect(shieldBadge).toBeDefined();
    });

    it('tipoBadgeLabel usa tradução i18n para melee', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const meeleeBadge = wrapper.findAllComponents({ name: 'QBadge' }).find(
        (b) => b.props('color') === 'warning',
      );
      // 'Corpo a Corpo' é a tradução pt-BR para melee
      expect(meeleeBadge!.props('label')).toBe('Corpo a Corpo');
    });
  });

  // ── Expand / Collapse ──────────────────────────────────────────────────────

  describe('Expand / Collapse', () => {
    beforeEach(() => {
      mockCombatSkills.value = combatSkillsFixture;
    });

    it('descrição não visível antes do clique', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).not.toContain('Combate corpo a corpo.');
    });

    it('clicar no chevron expande a descrição da linha correspondente', async () => {
      const wrapper = mountPage();
      await flushPromises();

      await wrapper.findAll('[data-testid="chevron-btn"]')[0]!.trigger('click');
      await nextTick();

      expect(wrapper.text()).toContain('Combate corpo a corpo.');
    });

    it('segundo clique no chevron colapsa a descrição', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const chevron = wrapper.findAll('[data-testid="chevron-btn"]')[0]!;
      await chevron.trigger('click');
      await nextTick();
      await chevron.trigger('click');
      await nextTick();

      expect(wrapper.text()).not.toContain('Combate corpo a corpo.');
    });

    it('expandir uma linha não expande as outras', async () => {
      const wrapper = mountPage();
      await flushPromises();

      // Expande apenas Luta (primeira linha)
      await wrapper.findAll('[data-testid="chevron-btn"]')[0]!.trigger('click');
      await nextTick();

      expect(wrapper.text()).toContain('Combate corpo a corpo.');
      expect(wrapper.text()).not.toContain('Disparo com arcos.');
    });
  });

  // ── filterMethod ───────────────────────────────────────────────────────────

  describe('filterMethod', () => {
    it('filtra por nome — correspondência parcial case-insensitive', () => {
      const wrapper = mountPage();
      const vm = wrapper.vm as InstanceType<typeof CombatSkillsPage> & {
        filterMethod: (rows: CombatSkill[], terms: { nome: string; tipo: string | null; atributo: string | null }) => CombatSkill[];
      };

      const result = vm.filterMethod(combatSkillsFixture, { nome: 'lut', tipo: null, atributo: null });

      expect(result).toHaveLength(1);
      expect(result[0]!.nome).toBe('Luta');
    });

    it('filtro por nome vazio retorna todas as rows', () => {
      const wrapper = mountPage();
      const vm = wrapper.vm as InstanceType<typeof CombatSkillsPage> & {
        filterMethod: (rows: CombatSkill[], terms: { nome: string; tipo: string | null; atributo: string | null }) => CombatSkill[];
      };

      const result = vm.filterMethod(combatSkillsFixture, { nome: '', tipo: null, atributo: null });

      expect(result).toHaveLength(3);
    });

    it('filtra por tipo melee — retorna apenas melee', () => {
      const wrapper = mountPage();
      const vm = wrapper.vm as InstanceType<typeof CombatSkillsPage> & {
        filterMethod: (rows: CombatSkill[], terms: { nome: string; tipo: string | null; atributo: string | null }) => CombatSkill[];
      };

      const result = vm.filterMethod(combatSkillsFixture, { nome: '', tipo: 'melee', atributo: null });

      expect(result).toHaveLength(1);
      expect(result[0]!.tipo).toBe('melee');
    });

    it('filtra por tipo null retorna tudo', () => {
      const wrapper = mountPage();
      const vm = wrapper.vm as InstanceType<typeof CombatSkillsPage> & {
        filterMethod: (rows: CombatSkill[], terms: { nome: string; tipo: string | null; atributo: string | null }) => CombatSkill[];
      };

      const result = vm.filterMethod(combatSkillsFixture, { nome: '', tipo: null, atributo: null });

      expect(result).toHaveLength(3);
    });

    it('filtra por atributo FR — retorna linhas com atributoAtaque=FR ou atributoDefesa=FR', () => {
      const wrapper = mountPage();
      const vm = wrapper.vm as InstanceType<typeof CombatSkillsPage> & {
        filterMethod: (rows: CombatSkill[], terms: { nome: string; tipo: string | null; atributo: string | null }) => CombatSkill[];
      };

      const result = vm.filterMethod(combatSkillsFixture, { nome: '', tipo: null, atributo: 'FR' });

      // Luta (atributoAtaque=FR) e Escudo (atributoDefesa=FR)
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.nome)).toContain('Luta');
      expect(result.map((r) => r.nome)).toContain('Escudo');
    });

    it('filtra por atributo DEX — retorna Arco (atributoAtaque=DEX)', () => {
      const wrapper = mountPage();
      const vm = wrapper.vm as InstanceType<typeof CombatSkillsPage> & {
        filterMethod: (rows: CombatSkill[], terms: { nome: string; tipo: string | null; atributo: string | null }) => CombatSkill[];
      };

      const result = vm.filterMethod(combatSkillsFixture, { nome: '', tipo: null, atributo: 'DEX' });

      expect(result).toHaveLength(1);
      expect(result[0]!.nome).toBe('Arco');
    });
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  describe('Loading', () => {
    it('QTable recebe loading=true quando composable sinaliza carregamento', async () => {
      mockLoading.value = true;
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTable' }).props('loading')).toBe(true);
    });

    it('QTable recebe loading=false quando carregamento termina', async () => {
      mockLoading.value = false;
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTable' }).props('loading')).toBe(false);
    });
  });
});
