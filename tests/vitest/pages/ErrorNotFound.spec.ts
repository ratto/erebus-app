import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar } from 'quasar';

import ErrorNotFound from '../../../src/pages/ErrorNotFound.vue';

// ─── Helper de montagem ───────────────────────────────────────────────────────

const mountOptions = {
  global: {
    plugins: [[Quasar, {}]] as [typeof Quasar, Record<string, unknown>][],
  },
};

function mountPage() {
  return mount(ErrorNotFound, mountOptions);
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('ErrorNotFound.vue', () => {
  // ── Renderização ───────────────────────────────────────────────────────────

  describe('Renderização', () => {
    it('renderiza o texto "404"', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('404');
    });

    it('renderiza o texto "Oops. Nothing here..."', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Oops. Nothing here...');
    });

    it('renderiza o botão "Go Home"', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'QBtn' }).exists()).toBe(true);
      expect(wrapper.text()).toContain('Go Home');
    });
  });

  // ── Layout e estilos ───────────────────────────────────────────────────────

  describe('Layout e estilos', () => {
    it('o container raiz possui a classe "fullscreen"', () => {
      const wrapper = mountPage();

      expect(wrapper.classes()).toContain('fullscreen');
    });

    it('o container raiz possui a classe "bg-blue"', () => {
      const wrapper = mountPage();

      expect(wrapper.classes()).toContain('bg-blue');
    });

    it('o container raiz possui a classe "text-white"', () => {
      const wrapper = mountPage();

      expect(wrapper.classes()).toContain('text-white');
    });
  });

  // ── Navegação ──────────────────────────────────────────────────────────────

  describe('Navegação', () => {
    it('o botão "Go Home" possui a prop "to" com valor "/"', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'QBtn' }).props('to')).toBe('/');
    });
  });
});
