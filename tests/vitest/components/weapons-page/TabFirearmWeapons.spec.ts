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

import TabFirearmWeapons from '../../../../src/components/weapons-page/TabFirearmWeapons.vue';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const weaponsFixture: Weapon[] = [
  {
    id: 1,
    nome: 'Glock 17',
    categoria: 'Pistola',
    dano: '2d6',
    iniciativa: '-2',
    fonte: 'Daemon',
    tipo: 'fogo',
    tipoDano: 'Perfurante',
    ocultabilidade: 'Alta',
    alcanceMedio: '25m',
    alcanceMax: '50m',
    calibre: '9mm',
    alcanceEfetivo: '25m',
    rof: '2',
    pente: '17',
  },
  {
    id: 2,
    nome: 'AK-47',
    categoria: 'Fuzil',
    dano: '3d6',
    iniciativa: '-4',
    fonte: 'Daemon',
    tipo: 'fogo',
    tipoDano: 'Perfurante',
    ocultabilidade: 'Nenhuma',
    alcanceMedio: '150m',
    alcanceMax: '400m',
    calibre: '7.62x39mm',
    alcanceEfetivo: '150m',
    rof: '4',
    pente: '30',
  },
  {
    id: 3,
    nome: 'Mossberg 500',
    categoria: 'Espingarda',
    dano: '4d6',
    iniciativa: '-3',
    fonte: 'Daemon',
    tipo: 'fogo',
    tipoDano: 'Perfurante',
    ocultabilidade: 'Baixa',
    alcanceMedio: '20m',
    alcanceMax: '40m',
    calibre: '12 gauge',
    alcanceEfetivo: '20m',
    rof: '1',
    pente: '6',
  },
];

// ─── Mount helper ─────────────────────────────────────────────────────────────

const mountOptions = {
  global: {
    plugins: [],
  },
};

function mountComponent() {
  return mount(TabFirearmWeapons, mountOptions);
}

// QInput has inheritAttrs: false in Quasar — data-testid does not propagate
// to the root element. We emit update:modelValue directly on the QInput
// component to update the model without relying on debounce or the native DOM.
async function typeSearch(wrapper: ReturnType<typeof mountComponent>, text: string) {
  const qInput = wrapper.findComponent({ name: 'QInput' });
  await qInput.vm.$emit('update:modelValue', text);
  await nextTick();
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('TabFirearmWeapons.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockWeapons.value = [];
  });

  // ── Initialization ─────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('calls getAllWeapons with type "fogo" once on mount', async () => {
      mountComponent();
      await flushPromises();

      expect(mockGetAllWeapons).toHaveBeenCalledOnce();
      expect(mockGetAllWeapons).toHaveBeenCalledWith('fogo');
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
      expect(text).toContain('Glock 17');
      expect(text).toContain('AK-47');
      expect(text).toContain('Mossberg 500');
    });

    it('displays the category of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Pistola');
      expect(text).toContain('Fuzil');
      expect(text).toContain('Espingarda');
    });

    it('displays the caliber of each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('9mm');
      expect(text).toContain('7.62x39mm');
      expect(text).toContain('12 gauge');
    });

    it('displays damage, ROF and magazine data for each weapon', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('2d6');
      expect(text).toContain('3d6');
      expect(text).toContain('17');
      expect(text).toContain('30');
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

  describe('Search filter (searchFirearm)', () => {
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

      await typeSearch(wrapper, 'Glock');

      const text = wrapper.text();
      expect(text).toContain('Glock 17');
      expect(text).not.toContain('AK-47');
      expect(text).not.toContain('Mossberg 500');
    });

    it('name filter is case-insensitive', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await typeSearch(wrapper, 'glock');

      expect(wrapper.text()).toContain('Glock 17');
    });

    it('partial filter returns multiple results when there are multiple matches', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      // "g" matches "Glock 17" and "Mossberg 500"
      await typeSearch(wrapper, 'g');

      const table = wrapper.findComponent({ name: 'QTable' });
      expect((table.props('rows') as Weapon[]).length).toBe(2);
    });

    it('clearing the field restores all weapons', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await typeSearch(wrapper, 'Glock');
      await typeSearch(wrapper, '');

      const text = wrapper.text();
      expect(text).toContain('Glock 17');
      expect(text).toContain('AK-47');
      expect(text).toContain('Mossberg 500');
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
