import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { Quasar } from 'quasar';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';
import MenuDrawer from 'src/components/MenuDrawer.vue';

const i18nInstance = createI18n({
  locale: 'pt-BR',
  legacy: false,
  messages,
});

const mountOptions = {
  props: {
    modelValue: true,
  },
  global: {
    plugins: [[Quasar, {}], i18nInstance],
    stubs: {
      QDrawer: { template: '<div><slot /></div>' },
    },
  },
};

function mountDrawer() {
  return mount(MenuDrawer, mountOptions);
}

describe('MenuDrawer.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o componente sem erros', () => {
    const wrapper = mountDrawer();

    expect(wrapper.exists()).toBe(true);
  });

  it('renderiza a seção de navegação', () => {
    const wrapper = mountDrawer();

    expect(wrapper.text()).toContain('Navegação');
  });

  it('renderiza link para Home', () => {
    const wrapper = mountDrawer();

    const homeLink = wrapper.findAll('[data-testid="nav-home"]');
    expect(homeLink.length).toBeGreaterThan(0);
  });

  it('renderiza link para Skills', () => {
    const wrapper = mountDrawer();

    const skillsLink = wrapper.findAll('[data-testid="nav-skills"]');
    expect(skillsLink.length).toBeGreaterThan(0);
  });

  it('renderiza link para Combat Skills', () => {
    const wrapper = mountDrawer();

    const combatLink = wrapper.findAll('[data-testid="nav-combat-skills"]');
    expect(combatLink.length).toBeGreaterThan(0);
  });

  it('renderiza link para Weapons', () => {
    const wrapper = mountDrawer();

    const weaponsLink = wrapper.findAll('[data-testid="nav-weapons"]');
    expect(weaponsLink.length).toBeGreaterThan(0);
  });

  it('renderiza link para Enhancements', () => {
    const wrapper = mountDrawer();

    const enhancementsLink = wrapper.findAll('[data-testid="nav-enhancements"]');
    expect(enhancementsLink.length).toBeGreaterThan(0);
  });

  it('renderiza link para Items', () => {
    const wrapper = mountDrawer();

    const itemsLink = wrapper.findAll('[data-testid="nav-items"]');
    expect(itemsLink.length).toBeGreaterThan(0);
  });

  it('renderiza link para Character', () => {
    const wrapper = mountDrawer();

    const characterLink = wrapper.findAll('[data-testid="nav-character"]');
    expect(characterLink.length).toBeGreaterThan(0);
  });

  it('emite update:modelValue quando prop modelValue muda', async () => {
    const wrapper = mount(MenuDrawer, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [[Quasar, {}], i18nInstance],
        stubs: {
          QDrawer: {
            template: '<div @click="$emit(\'update:modelValue\', false)"><slot /></div>',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.emitted('update:modelValue')).toBeDefined();
  });
});
