import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Quasar } from 'quasar';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';

import type { Skill } from 'src/model/types/skill.type';

// vi.hoisted garante que os refs sejam criados antes do hoisting do vi.mock,
// permitindo que o mock e os testes compartilhem o mesmo estado reativo.
const { mockLoading, mockSkills, mockGetAllSkills } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
  const { ref } = require('vue') as typeof import('vue');
  return {
    mockLoading: ref(false),
    mockSkills: ref<Skill[]>([]),
    mockGetAllSkills: vi.fn().mockResolvedValue(undefined),
  };
});

// London style: isola completamente o composable. O componente nunca toca na
// camada de rede — todo estado é controlado pelos refs acima.
vi.mock('src/composables/skills.composable', () => ({
  useSkills: () => ({
    loading: mockLoading,
    skills: mockSkills,
    getAllSkills: mockGetAllSkills,
  }),
}));

import SkillsPage from '../../../src/pages/SkillsPage.vue';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const skillsFixture: Skill[] = [
  {
    id: 1,
    name: 'Sword',
    group: 'Combat',
    atributoBase: 'FR',
    apenasComTreinamento: false,
    synergy: 'Shield',
    description: 'Habilidade com lâminas longas e combate direto.',
  },
  {
    id: 2,
    name: 'Stealth',
    group: 'Furtive',
    atributoBase: 'AGI',
    apenasComTreinamento: true,
    synergy: null,
    description: 'Mover-se sem ser detectado.',
  },
  {
    id: 3,
    name: 'Occultism',
    group: 'Magic',
    atributoBase: 'INT',
    apenasComTreinamento: true,
    synergy: null,
    description: 'Conhecimento de artes arcanas e rituais.',
  },
];

// ─── Helper de montagem ───────────────────────────────────────────────────────

// const i18nInstance = createI18n({ locale: 'pt-BR', legacy: false, messages });

const mountOptions = {
  global: {
    // plugins: [[Quasar, {}], i18nInstance],
    stubs: {
      // QPage exige QLayout para não emitir warnings; stub simples evita o problema
      QPage: { template: '<div><slot /></div>' },
    },
  },
};

function mountPage() {
  return mount(SkillsPage, mountOptions);
}

// QSelect e QInput têm inheritAttrs: false no Quasar — data-testid não vai para
// o root element. Buscamos o QSelect pelo prop `label` em vez de atributo DOM.
function findSelectByTestId(wrapper: ReturnType<typeof mountPage>, testId: string) {
  const labelMap: Record<string, string> = {
    'select-grupo': 'Grupo',
    'select-atributo': 'Atributo Base',
  };
  const label = labelMap[testId];
  const match = wrapper
    .findAllComponents({ name: 'QSelect' })
    .find((c) => c.props('label') === label);
  if (!match) throw new Error(`QSelect com data-testid="${testId}" não encontrado`);
  return match;
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('SkillsPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockSkills.value = [];
  });

  // ── Inicialização ──────────────────────────────────────────────────────────

  describe('Inicialização', () => {
    it('chama getAllSkills uma vez ao montar o componente', async () => {
      mountPage();
      await flushPromises();

      expect(mockGetAllSkills).toHaveBeenCalledOnce();
    });

    it('renderiza a q-table independente do estado dos dados', () => {
      const wrapper = mountPage();

      expect(wrapper.find('.q-table').exists()).toBe(true);
    });

    it('exibe mensagem de estado vazio quando não há perícias', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).toContain('Nenhuma perícia encontrada para os filtros aplicados.');
    });
  });

  // ── Exibição das perícias ──────────────────────────────────────────────────

  describe('Exibição das perícias', () => {
    beforeEach(() => {
      mockSkills.value = skillsFixture;
    });

    it('exibe o nome de cada perícia carregada', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Sword');
      expect(text).toContain('Stealth');
      expect(text).toContain('Occultism');
    });

    it('exibe um badge por linha (v-if/v-else em apenasComTreinamento)', async () => {
      const wrapper = mountPage();
      await flushPromises();

      // Cada linha renderiza exatamente um QBadge: "Não" ou "Sim"
      const badges = wrapper.findAllComponents({ name: 'QBadge' });
      expect(badges).toHaveLength(skillsFixture.length);
    });

    it('badge "Sim" aparece para perícias que requerem treinamento', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).toContain('Sim'); // Furtividade e Ocultismo
    });

    it('badge "Não" aparece para perícias que não requerem treinamento', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).toContain('Não'); // Espada
    });

    it('exibe "—" para campos nulos (sinergia de Furtividade e Ocultismo)', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).toContain('—');
    });
  });

  // ── Expandir / Colapsar descrição ─────────────────────────────────────────

  describe('Expandir / colapsar descrição', () => {
    beforeEach(() => {
      mockSkills.value = skillsFixture;
    });

    it('descrição não é visível antes de clicar no chevron', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).not.toContain('Habilidade com lâminas longas');
    });

    it('clicar no chevron expande a descrição da linha correspondente', async () => {
      const wrapper = mountPage();
      await flushPromises();

      await wrapper.findAll('[data-testid="chevron-btn"]')[0]!.trigger('click');

      expect(wrapper.text()).toContain('Habilidade com lâminas longas');
    });

    it('segundo clique no chevron colapsa a descrição', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const chevron = wrapper.findAll('[data-testid="chevron-btn"]')[0]!;
      await chevron.trigger('click');
      await chevron.trigger('click');

      expect(wrapper.text()).not.toContain('Habilidade com lâminas longas');
    });

    it('expandir uma linha não expande as demais', async () => {
      const wrapper = mountPage();
      await flushPromises();

      // Expande apenas a primeira linha (Sword)
      await wrapper.findAll('[data-testid="chevron-btn"]')[0]!.trigger('click');

      expect(wrapper.text()).toContain('Habilidade com lâminas longas');
      expect(wrapper.text()).not.toContain('Mover-se sem ser detectado');
    });
  });

  // ── Estado de loading ──────────────────────────────────────────────────────

  describe('Estado de loading', () => {
    it('q-table recebe loading=true quando o composable sinaliza carregamento', async () => {
      mockLoading.value = true;
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTable' }).props('loading')).toBe(true);
    });

    it('q-table recebe loading=false quando o carregamento termina', async () => {
      mockLoading.value = false;
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTable' }).props('loading')).toBe(false);
    });

    it('q-table reage reativamente à transição de loading true → false', async () => {
      mockLoading.value = true;
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTable' }).props('loading')).toBe(true);

      mockLoading.value = false;
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTable' }).props('loading')).toBe(false);
    });
  });

  // ── Filtro por nome ────────────────────────────────────────────────────────

  describe('Filtro por nome (searchText)', () => {
    // QInput usa debounce="300" via setTimeout; fake timers permitem avançar
    // o relógio sem aguardar 300ms reais de wall time.
    beforeEach(() => {
      mockSkills.value = skillsFixture;
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    async function typeSearch(wrapper: ReturnType<typeof mountPage>, text: string) {
      // QInput tem inheritAttrs: false — o <input> nativo não é acessível via
      // data-testid. Emitimos update:modelValue direto no componente para
      // atualizar searchText sem depender do debounce do DOM.
      const qInput = wrapper.findComponent({ name: 'QInput' });
      await qInput.vm.$emit('update:modelValue', text);
      await nextTick();
    }

    it('filtra skills pelo texto digitado (correspondência parcial)', async () => {
      const wrapper = mountPage();
      await flushPromises();

      await typeSearch(wrapper, 'Swor');

      const text = wrapper.text();
      expect(text).toContain('Sword');
      expect(text).not.toContain('Stealth');
      expect(text).not.toContain('Occultism');
    });

    it('filtro por nome é case-insensitive', async () => {
      const wrapper = mountPage();
      await flushPromises();

      await typeSearch(wrapper, 'swor');

      expect(wrapper.text()).toContain('Sword');
    });

    it('limpar o campo restaura todas as skills', async () => {
      const wrapper = mountPage();
      await flushPromises();

      await typeSearch(wrapper, 'Swor');
      await typeSearch(wrapper, '');

      const text = wrapper.text();
      expect(text).toContain('Sword');
      expect(text).toContain('Stealth');
      expect(text).toContain('Occultism');
    });

    it('busca sem correspondência exibe mensagem de estado vazio', async () => {
      const wrapper = mountPage();
      await flushPromises();

      await typeSearch(wrapper, 'xyzw_inexistente');

      expect(wrapper.text()).toContain('Nenhuma perícia encontrada para os filtros aplicados.');
    });
  });

  // ── Filtro por grupo ───────────────────────────────────────────────────────

  describe('Filtro por grupo', () => {
    beforeEach(() => {
      mockSkills.value = skillsFixture;
    });

    it('exibe apenas as skills do grupo selecionado', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const select = findSelectByTestId(wrapper, 'select-grupo');
      await select.vm.$emit('update:modelValue', 'Combat');
      await nextTick();

      const text = wrapper.text();
      expect(text).toContain('Sword');
      expect(text).not.toContain('Stealth');
      expect(text).not.toContain('Occultism');
    });

    it('selecionar null remove o filtro de grupo e exibe todas as skills', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const select = findSelectByTestId(wrapper, 'select-grupo');
      await select.vm.$emit('update:modelValue', 'Combat');
      await nextTick();

      await select.vm.$emit('update:modelValue', null);
      await nextTick();

      const text = wrapper.text();
      expect(text).toContain('Sword');
      expect(text).toContain('Stealth');
      expect(text).toContain('Occultism');
    });
  });

  // ── Filtro por atributo base ───────────────────────────────────────────────

  describe('Filtro por atributo base', () => {
    beforeEach(() => {
      mockSkills.value = skillsFixture;
    });

    it('exibe apenas as skills do atributo selecionado', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const select = findSelectByTestId(wrapper, 'select-atributo');
      await select.vm.$emit('update:modelValue', 'AGI');
      await nextTick();

      const text = wrapper.text();
      expect(text).toContain('Stealth');
      expect(text).not.toContain('Sword');
      expect(text).not.toContain('Occultism');
    });

    it('valor __none__ filtra skills sem atributo base', async () => {
      mockSkills.value = [
        ...skillsFixture,
        {
          id: 4,
          name: 'Luck',
          group: null,
          atributoBase: null,
          apenasComTreinamento: false,
          synergy: null,
          description: 'Depende inteiramente do destino.',
        },
      ];
      const wrapper = mountPage();
      await flushPromises();

      const select = findSelectByTestId(wrapper, 'select-atributo');
      await select.vm.$emit('update:modelValue', '__none__');
      await nextTick();

      const text = wrapper.text();
      expect(text).toContain('Luck');
      expect(text).not.toContain('Sword');
      expect(text).not.toContain('Stealth');
    });

    it('selecionar null remove o filtro e exibe todas as skills', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const select = findSelectByTestId(wrapper, 'select-atributo');
      await select.vm.$emit('update:modelValue', 'INT');
      await nextTick();

      await select.vm.$emit('update:modelValue', null);
      await nextTick();

      const text = wrapper.text();
      expect(text).toContain('Sword');
      expect(text).toContain('Stealth');
      expect(text).toContain('Occultism');
    });
  });
});
