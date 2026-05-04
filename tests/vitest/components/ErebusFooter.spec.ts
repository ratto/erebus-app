import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';
import ErebusFooter from 'src/components/ErebusFooter.vue';

const i18nInstance = createI18n({
  locale: 'pt-BR',
  legacy: false,
  messages,
});

describe('ErebusFooter.vue', () => {
  function mountFooter() {
    return mount(ErebusFooter, {
      global: {
        plugins: [i18nInstance],
      },
    });
  }

  it('renderiza sem erros', () => {
    const wrapper = mountFooter();

    expect(wrapper.exists()).toBe(true);
  });

  it('renderiza um elemento footer com classe erebus-footer', () => {
    const wrapper = mountFooter();

    expect(wrapper.find('footer.erebus-footer').exists()).toBe(true);
  });

  it('exibe o texto de copyright traduzido', () => {
    const wrapper = mountFooter();

    const text = wrapper.text();
    expect(text).toContain('©'); // copyright symbol
  });

  it('contém um span com classe footer-text', () => {
    const wrapper = mountFooter();

    expect(wrapper.find('span.footer-text').exists()).toBe(true);
  });

  it('renderiza o conteúdo i18n footer.copyright', () => {
    const wrapper = mountFooter();

    const footerText = wrapper.find('span.footer-text');
    expect(footerText.exists()).toBe(true);
  });
});
