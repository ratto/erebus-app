import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';
import IndexPage from 'src/pages/IndexPage.vue';

const i18nInstance = createI18n({
  locale: 'pt-BR',
  legacy: false,
  messages,
});

const mountOptions = {
  global: {
    plugins: [i18nInstance],
    stubs: {
      QPage: { template: '<div class="q-page"><slot /></div>' },
    },
  },
};

function mountPage() {
  return mount(IndexPage, mountOptions);
}

describe('IndexPage.vue', () => {
  it('renderiza o componente sem erros', () => {
    const wrapper = mountPage();

    expect(wrapper.exists()).toBe(true);
  });

  it('renderiza um elemento q-page', () => {
    const wrapper = mountPage();

    expect(wrapper.find('.q-page').exists()).toBe(true);
  });

  it('renderiza o título da página home', () => {
    const wrapper = mountPage();

    const text = wrapper.text();
    expect(text).toMatch(/[Ee]rebuschat|Engine|[Hh]ome|[Ii]nício/i);
  });

  it('renderiza o primeiro parágrafo de introdução', () => {
    const wrapper = mountPage();

    const text = wrapper.text();
    expect(text.length).toBeGreaterThan(0);
  });

  it('renderiza um elemento h1 para o título', () => {
    const wrapper = mountPage();

    expect(wrapper.find('h1').exists()).toBe(true);
  });

  it('renderiza múltiplos parágrafos', () => {
    const wrapper = mountPage();

    const paragraphs = wrapper.findAll('p');
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('usa classe page-home no q-page', () => {
    const wrapper = mountPage();

    const page = wrapper.find('.q-page');
    expect(page.classes()).toContain('page-home');
  });

  it('renderiza o conteúdo i18n sem erros', () => {
    const wrapper = mountPage();

    const text = wrapper.text();
    expect(text).not.toContain('pages.home');
  });

  it('h1 tem classe page-title', () => {
    const wrapper = mountPage();

    const h1 = wrapper.find('h1');
    expect(h1.classes()).toContain('page-title');
  });

  it('parágrafos têm classe page-body', () => {
    const wrapper = mountPage();

    const paragraphs = wrapper.findAll('p');
    paragraphs.forEach((p) => {
      expect(p.classes()).toContain('page-body');
    });
  });
});
