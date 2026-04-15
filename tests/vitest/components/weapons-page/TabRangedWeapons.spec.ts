import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Quasar } from 'quasar';

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

import TabRangedWeapons from '../../../../src/components/weapons-page/TabRangedWeapons.vue';

// ─── Fixtures ────────────────────────────────────────────────────────────────

// Ranged melee weapons (tipo: 'branca_distancia') — Sistema Daemon archetypes.
// alcanceMedio and alcanceMax are the columns unique to this tab.
const weaponsFixture: Weapon[] = [
  {
    id: 1,
    nome: 'Arco Curto',
    categoria: 'Arco',
    dano: '1d6',
    iniciativa: '0',
    fonte: 'Daemon',
    tipo: 'branca_distancia',
    tipoDano: 'Perfurante',
    ocultabilidade: 'Baixa',
    alcanceMedio: '30m',
    alcanceMax: '60m',
    calibre: null,
    alcanceEfetivo: null,
    rof: null,
    pente: null,
  },
  {
    id: 2,
    nome: 'Besta Leve',
    categoria: 'Besta',
    dano: '2d6',
    iniciativa: '-2',
    fonte: 'Daemon',
    tipo: 'branca_distancia',
    tipoDano: 'Perfurante',
    ocultabilidade: 'Nenhuma',
    alcanceMedio: '40m',
    alcanceMax: '80m',
    calibre: null,
    alcanceEfetivo: null,
    rof: null,
    pente: null,
  },
  {
    id: 3,
    nome: 'Arco Longo',
    categoria: 'Arco',
    dano: '1d8',
    iniciativa: '-1',
    fonte: 'Daemon',
    tipo: 'branca_distancia',
    tipoDano: 'Perfurante',
    ocultabilidade: 'Impossível',
    alcanceMedio: '60m',
    alcanceMax: '120m',
    calibre: null,
    alcanceEfetivo: null,
    rof: null,
    pente: null,
  },
];

// ─── Mount helper ─────────────────────────────────────────────────────────────

const mountOptions = {
  global: {
    plugins: [[Quasar, {}]] as [typeof Quasar, Record<string, unknown>][],
  },
};

function mountComponent() {
  return mount(TabRangedWeapons, mountOptions);
}

// QInput has inheritAttrs: false in Quasar — data-testid does not propagate
// to the root element. We emit update:modelValue directly on the QInput
// component to update searchRanged without relying on debounce or the native DOM.
async function typeSearch(wrapper: ReturnType<typeof mountComponent>, text: string) {
  const qInput = wrapper.findComponent({ name: 'QInput' });
  await qInput.vm.$emit('update:modelValue', text);
  await nextTick();
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('TabRangedWeapons.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockWeapons.value = [];
  });

  // ── Initialization ─────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('calls getAllWeapons with type "branca_distancia" once on mount', async () => {
      mountComponent();
      await flushPromises();

      expect(mockGetAllWeapons).toHaveBeenCalledOnce();
      expect(mockGetAllWeapons).toHaveBeenCalledWith('branca_distancia');
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
      expect(text).toContain('Arco Curto');
      expect(text).toContain('Besta Leve');
      expect(text).toContain('Arco Longo');
    });

    it('displays the category of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Arco');
      expect(text).toContain('Besta');
    });

    it('displays the damage of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('1d6');
      expect(text).toContain('2d6');
      expect(text).toContain('1d8');
    });

    it('displays the initiative modifier of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('-2');
      expect(text).toContain('-1');
    });

    it('displays the medium range of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('30m');
      expect(text).toContain('40m');
      expect(text).toContain('60m');
    });

    it('displays the maximum range of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('60m');
      expect(text).toContain('80m');
      expect(text).toContain('120m');
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

  describe('Search filter (searchRanged)', () => {
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

      await typeSearch(wrapper, 'Besta');

      const text = wrapper.text();
      expect(text).toContain('Besta Leve');
      expect(text).not.toContain('Arco Curto');
      expect(text).not.toContain('Arco Longo');
    });

    it('name filter is case-insensitive', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await typeSearch(wrapper, 'besta');

      expect(wrapper.text()).toContain('Besta Leve');
    });

    it('partial filter returns multiple results when there are multiple matches', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      // "Arco" matches "Arco Curto" and "Arco Longo"
      await typeSearch(wrapper, 'Arco');

      const table = wrapper.findComponent({ name: 'QTable' });
      expect((table.props('rows') as Weapon[]).length).toBe(2);
    });

    it('clearing the field restores all weapons', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await typeSearch(wrapper, 'Besta');
      await typeSearch(wrapper, '');

      const text = wrapper.text();
      expect(text).toContain('Arco Curto');
      expect(text).toContain('Besta Leve');
      expect(text).toContain('Arco Longo');
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
