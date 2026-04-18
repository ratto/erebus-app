import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Quasar } from 'quasar';

import WeaponsPage from '../../../src/pages/WeaponsPage.vue';

// ─── Mount helper ─────────────────────────────────────────────────────────────

const mountOptions = {
  global: {
    plugins: [[Quasar, {}]] as [typeof Quasar, Record<string, unknown>][],
    stubs: {
      // QPage requires QLayout to avoid console warnings; simple div stub avoids the issue.
      QPage: { template: '<div><slot /></div>' },
      // Stub child tab components — each one has its own dedicated spec file.
      // Stubbing them here prevents composable/network calls from firing in page-level tests.
      TabMeeleeWeapons: { template: '<div data-testid="stub-meelee" />' },
      TabRangedWeapons: { template: '<div data-testid="stub-ranged" />' },
      TabFirearmWeapons: { template: '<div data-testid="stub-firearm" />' },
    },
  },
};

function mountPage() {
  return mount(WeaponsPage, mountOptions);
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('WeaponsPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('renders the tab navigation bar', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'QTabs' }).exists()).toBe(true);
    });

    it('renders exactly three QTab elements', () => {
      const wrapper = mountPage();

      expect(wrapper.findAllComponents({ name: 'QTab' })).toHaveLength(3);
    });

    it('renders the tab panels container', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'QTabPanels' }).exists()).toBe(true);
    });

    it('renders all three tab labels in the DOM', () => {
      const wrapper = mountPage();
      const text = wrapper.text();

      expect(text).toContain('Brancas');
      expect(text).toContain('À Distância');
      expect(text).toContain('Fogo');
    });
  });

  // ── Tab labels and names ───────────────────────────────────────────────────

  describe('Tab labels and names', () => {
    // Each QTab must carry the right `name` (used by v-model) and `label`
    // (displayed to the user). A mismatch here breaks navigation entirely.

    it('"Brancas" tab has name="meelee"', () => {
      const wrapper = mountPage();
      const tab = wrapper.findAllComponents({ name: 'QTab' }).find((t) => t.props('name') === 'meelee');

      expect(tab).toBeDefined();
      expect(tab!.props('label')).toBe('Brancas');
    });

    it('"À Distância" tab has name="ranged"', () => {
      const wrapper = mountPage();
      const tab = wrapper.findAllComponents({ name: 'QTab' }).find((t) => t.props('name') === 'ranged');

      expect(tab).toBeDefined();
      expect(tab!.props('label')).toBe('À Distância');
    });

    it('"Fogo" tab has name="firearm"', () => {
      const wrapper = mountPage();
      const tab = wrapper.findAllComponents({ name: 'QTab' }).find((t) => t.props('name') === 'firearm');

      expect(tab).toBeDefined();
      expect(tab!.props('label')).toBe('Fogo');
    });
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  describe('Initial state', () => {
    it('the "meelee" tab is selected by default', () => {
      const wrapper = mountPage();

      // QTabPanels reflects the same activeTab ref that drives QTabs.
      expect(wrapper.findComponent({ name: 'QTabPanels' }).props('modelValue')).toBe('meelee');
    });

    it('QTabs also starts with modelValue="meelee"', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'QTabs' }).props('modelValue')).toBe('meelee');
    });
  });

  // ── Tab navigation ─────────────────────────────────────────────────────────

  describe('Tab navigation', () => {
    // QTabs emits `update:modelValue` when the user picks a different tab.
    // Emitting that event directly on the component mirrors what Quasar does
    // internally when the user clicks a tab, without depending on DOM clicks
    // that require a real browser environment.

    it('switching to "ranged" updates QTabPanels modelValue', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'ranged');
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTabPanels' }).props('modelValue')).toBe('ranged');
    });

    it('switching to "firearm" updates QTabPanels modelValue', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'firearm');
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTabPanels' }).props('modelValue')).toBe('firearm');
    });

    it('switching back to "meelee" restores the initial panel', async () => {
      const wrapper = mountPage();
      const tabs = wrapper.findComponent({ name: 'QTabs' });

      await tabs.vm.$emit('update:modelValue', 'ranged');
      await nextTick();

      await tabs.vm.$emit('update:modelValue', 'meelee');
      await nextTick();

      expect(wrapper.findComponent({ name: 'QTabPanels' }).props('modelValue')).toBe('meelee');
    });

    it('QTabs and QTabPanels share the same modelValue after navigation', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'firearm');
      await nextTick();

      const qTabs = wrapper.findComponent({ name: 'QTabs' });
      const qTabPanels = wrapper.findComponent({ name: 'QTabPanels' });

      // Both components are driven by the same `activeTab` ref via v-model.
      expect(qTabs.props('modelValue')).toBe(qTabPanels.props('modelValue'));
    });
  });

  // ── Child components ───────────────────────────────────────────────────────

  describe('Child components', () => {
    // QTabPanels with keep-alive mounts each panel lazily on first activation,
    // then keeps it alive so it is not destroyed when the user switches tabs.
    // The active panel is rendered immediately; inactive panels are mounted only
    // after they have been visited at least once.

    it('mounts TabMeeleeWeapons on the initial render (default active tab)', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="stub-meelee"]').exists()).toBe(true);
    });

    it('mounts TabRangedWeapons after navigating to the ranged tab', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'ranged');
      await nextTick();

      expect(wrapper.find('[data-testid="stub-ranged"]').exists()).toBe(true);
    });

    it('mounts TabFirearmWeapons after navigating to the firearm tab', async () => {
      const wrapper = mountPage();

      await wrapper.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'firearm');
      await nextTick();

      expect(wrapper.find('[data-testid="stub-firearm"]').exists()).toBe(true);
    });

    it('keeps TabMeeleeWeapons alive after switching away from the meelee tab', async () => {
      const wrapper = mountPage();
      const tabs = wrapper.findComponent({ name: 'QTabs' });

      // Navigate away then back — keep-alive ensures the component stays mounted.
      await tabs.vm.$emit('update:modelValue', 'ranged');
      await nextTick();

      await tabs.vm.$emit('update:modelValue', 'meelee');
      await nextTick();

      expect(wrapper.find('[data-testid="stub-meelee"]').exists()).toBe(true);
    });
  });
});
