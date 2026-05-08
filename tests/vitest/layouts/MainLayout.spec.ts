import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';

import MainLayout from 'src/layouts/MainLayout.vue';
import ErebusTopbar from 'src/components/ErebusTopbar.vue';
import MenuDrawer from 'src/components/MenuDrawer.vue';
import ErebusFooter from 'src/components/ErebusFooter.vue';

// ─── Helper de montagem ───────────────────────────────────────────────────────

// ChatDrawer usa useChat() → useChatStore() → Pinia.
// Fazemos stub do componente para isolar o MainLayout de dependências externas,
// seguindo o mesmo padrão dos outros componentes filhos.
const mountOptions = {
  global: {
    plugins: [],
    stubs: {
      ErebusTopbar: true,
      MenuDrawer: true,
      ErebusFooter: true,
      RouterView: true,
      ChatDrawer: true,
    },
  },
};

beforeEach(() => {
  setActivePinia(createPinia());
});

function mountLayout() {
  return mount(MainLayout, mountOptions);
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('MainLayout.vue', () => {
  // ── Renderização ───────────────────────────────────────────────────────────

  describe('Renderização', () => {
    it('renderiza o componente sem erros', () => {
      expect(() => mountLayout()).not.toThrow();
    });

    it('exibe o ErebusTopbar', () => {
      const wrapper = mountLayout();

      expect(wrapper.findComponent(ErebusTopbar).exists()).toBe(true);
    });

    it('exibe o MenuDrawer', () => {
      const wrapper = mountLayout();

      expect(wrapper.findComponent(MenuDrawer).exists()).toBe(true);
    });

    it('exibe o ErebusFooter', () => {
      const wrapper = mountLayout();

      expect(wrapper.findComponent(ErebusFooter).exists()).toBe(true);
    });

    it('renderiza o router-view', () => {
      const wrapper = mountLayout();

      expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true);
    });
  });

  // ── Drawer ─────────────────────────────────────────────────────────────────

  describe('Drawer', () => {
    it('o drawer começa fechado', () => {
      const wrapper = mountLayout();

      expect(wrapper.findComponent(MenuDrawer).props('modelValue')).toBe(false);
    });

    it('toggle-menu abre o drawer', async () => {
      const wrapper = mountLayout();

      wrapper.findComponent(ErebusTopbar).vm.$emit('toggle-menu');
      await nextTick();

      expect(wrapper.findComponent(MenuDrawer).props('modelValue')).toBe(true);
    });

    it('toggle-menu fecha o drawer quando já estava aberto', async () => {
      const wrapper = mountLayout();

      wrapper.findComponent(ErebusTopbar).vm.$emit('toggle-menu');
      await nextTick();
      wrapper.findComponent(ErebusTopbar).vm.$emit('toggle-menu');
      await nextTick();

      expect(wrapper.findComponent(MenuDrawer).props('modelValue')).toBe(false);
    });
  });
});
