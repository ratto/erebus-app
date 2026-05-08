import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';


import type { Weapon } from 'src/model/types/weapon.type';

// vi.hoisted ensures refs are created before vi.mock hoisting,
// allowing the mock and tests to share the same reactive state.
const { mockLoading, mockWeapons, mockGetAllWeapons } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
  const { ref } = require('vue') as typeof import('vue');
  return {
    mockLoading: ref(false),
    mockWeapons: ref<Weapon[]>([]),
    mockGetAllWeapons: vi.fn().mockResolvedValue(undefined),
  };
});

// London style: fully isolates the composable. The component never touches
// the network layer — all state is controlled by the refs above.
vi.mock('src/composables/weapons.composable', () => ({
  useWeapons: () => ({
    loading: mockLoading,
    weapons: mockWeapons,
    getAllWeapons: mockGetAllWeapons,
  }),
}));

import TabMeeleeWeapons from '../../../../src/components/weapons-page/TabMeeleeWeapons.vue';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const weaponsFixture: Weapon[] = [
  {
    id: 1,
    nome: 'Espada Longa',
    categoria: 'Espada',
    dano: '1d6+2',
    iniciativa: '-2',
    fonte: 'Daemon',
    tipo: 'branca',
    tipoDano: 'Cortante',
    ocultabilidade: 'Impossível',
    alcanceMedio: null,
    alcanceMax: null,
    calibre: null,
    alcanceEfetivo: null,
    rof: null,
    pente: null,
  },
  {
    id: 2,
    nome: 'Adaga',
    categoria: 'Faca',
    dano: '1d4',
    iniciativa: '+1',
    fonte: 'Daemon',
    tipo: 'branca',
    tipoDano: 'Perfurante',
    ocultabilidade: 'Alta',
    alcanceMedio: null,
    alcanceMax: null,
    calibre: null,
    alcanceEfetivo: null,
    rof: null,
    pente: null,
  },
  {
    id: 3,
    nome: 'Machado de Guerra',
    categoria: 'Machado',
    dano: '2d6',
    iniciativa: '-4',
    fonte: 'Daemon',
    tipo: 'branca',
    tipoDano: 'Cortante',
    ocultabilidade: 'Nenhuma',
    alcanceMedio: null,
    alcanceMax: null,
    calibre: null,
    alcanceEfetivo: null,
    rof: null,
    pente: null,
  },
];

// ─── Mount helper ─────────────────────────────────────────────────────────────

const mountOptions = {
  global: {
    plugins: [],
  },
};

function mountComponent() {
  return mount(TabMeeleeWeapons, mountOptions);
}

// QInput has inheritAttrs: false in Quasar — data-testid does not propagate
// to the root element. We emit update:modelValue directly on the QInput
// component to update searchMeelee without relying on debounce or the native DOM.
async function typeSearch(wrapper: ReturnType<typeof mountComponent>, text: string) {
  const qInput = wrapper.findComponent({ name: 'QInput' });
  await qInput.vm.$emit('update:modelValue', text);
  await nextTick();
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('TabMeeleeWeapons.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockWeapons.value = [];
  });

  // ── Initialization ─────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('calls getAllWeapons with type "branca" once on mount', async () => {
      mountComponent();
      await flushPromises();

      expect(mockGetAllWeapons).toHaveBeenCalledOnce();
      expect(mockGetAllWeapons).toHaveBeenCalledWith('branca');
    });

    it('renders the q-table regardless of data state', () => {
      const wrapper = mountComponent();

      expect(wrapper.find('.q-table').exists()).toBe(true);
    });

    it('shows empty state message when there are no weapons', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.text()).toContain('Nenhuma arma encontrada.');
    });

    it('renders the search input on mount', () => {
      const wrapper = mountComponent();

      expect(wrapper.findComponent({ name: 'QInput' }).exists()).toBe(true);
    });
  });

  // ── Weapon display ─────────────────────────────────────────────────────────

  describe('Weapon display', () => {
    beforeEach(() => {
      mockWeapons.value = weaponsFixture;
    });

    it('displays the name of each loaded weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Espada Longa');
      expect(text).toContain('Adaga');
      expect(text).toContain('Machado de Guerra');
    });

    it('displays the category of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Espada');
      expect(text).toContain('Faca');
      expect(text).toContain('Machado');
    });

    it('displays the damage of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('1d6+2');
      expect(text).toContain('1d4');
      expect(text).toContain('2d6');
    });

    it('displays the initiative modifier of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('-2');
      expect(text).toContain('+1');
      expect(text).toContain('-4');
    });

    it('displays the damage type of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Cortante');
      expect(text).toContain('Perfurante');
    });

    it('displays the concealability of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Impossível');
      expect(text).toContain('Alta');
      expect(text).toContain('Nenhuma');
    });

    it('passes all filtered rows to the q-table rows prop', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const table = wrapper.findComponent({ name: 'QTable' });
      expect((table.props('rows') as Weapon[]).length).toBe(weaponsFixture.length);
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe('Loading state', () => {
    it('q-table receives loading=true when the composable signals loading', async () => {
      mockLoading.value = true;
      const wrapper = mountComponent();
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTable' }).props('loading')).toBe(true);
    });

    it('q-table receives loading=false when loading is complete', async () => {
      mockLoading.value = false;
      const wrapper = mountComponent();
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTable' }).props('loading')).toBe(false);
    });

    it('q-table reacts to the loading true → false transition', async () => {
      mockLoading.value = true;
      const wrapper = mountComponent();
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTable' }).props('loading')).toBe(true);

      mockLoading.value = false;
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTable' }).props('loading')).toBe(false);
    });
  });

  // ── Search filter ──────────────────────────────────────────────────────────

  describe('Search filter (searchMeelee)', () => {
    // QInput uses debounce="300" — fake timers let us control the clock
    // without waiting real wall time. The typeSearch helper emits
    // update:modelValue directly on QInput, bypassing DOM debounce.
    beforeEach(() => {
      mockWeapons.value = weaponsFixture;
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('filters weapons by typed text (partial name match)', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await typeSearch(wrapper, 'Espada');

      const text = wrapper.text();
      expect(text).toContain('Espada Longa');
      expect(text).not.toContain('Adaga');
      expect(text).not.toContain('Machado de Guerra');
    });

    it('name filter is case-insensitive', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await typeSearch(wrapper, 'espada');

      expect(wrapper.text()).toContain('Espada Longa');
    });

    it('partial filter returns multiple results when there are multiple matches', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      // "a" matches "Espada Longa", "Adaga" and "Machado de Guerra"
      await typeSearch(wrapper, 'a');

      const table = wrapper.findComponent({ name: 'QTable' });
      expect((table.props('rows') as Weapon[]).length).toBe(3);
    });

    it('clearing the field restores all weapons', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await typeSearch(wrapper, 'Espada');
      await typeSearch(wrapper, '');

      const text = wrapper.text();
      expect(text).toContain('Espada Longa');
      expect(text).toContain('Adaga');
      expect(text).toContain('Machado de Guerra');
    });

    it('search with no match shows empty state message', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await typeSearch(wrapper, 'xyzw_nonexistent');

      expect(wrapper.text()).toContain('Nenhuma arma encontrada.');
    });

    it('empty search field shows all weapons without filtering', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await typeSearch(wrapper, '');

      const table = wrapper.findComponent({ name: 'QTable' });
      expect((table.props('rows') as Weapon[]).length).toBe(weaponsFixture.length);
    });
  });
});
