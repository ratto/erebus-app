import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import ChatDrawer from 'src/components/ChatDrawer.vue';

const { mockSendCommand } = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue');
  return {
    mockSendCommand: vi.fn().mockResolvedValue(undefined),
    mockMessages: ref([]),
  };
});

vi.mock('src/composables/chat.composable', () => ({
  useChat: () => ({
    messages: mockMessages,
    sendCommand: mockSendCommand,
  }),
}));

const mockMessages = ref<Array<{ id: string; type: string; timestamp: string; content: string }>>([]);

const mountOptions = {
  props: {
    modelValue: true,
  },
  global: {
    plugins: [],
    stubs: {
      QDrawer: { template: '<div><slot /></div>' },
      QBtn: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
      QInput: {
        template: `<input
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          @keyup.enter="$emit('keyup.enter')"
        />`,
        props: ['modelValue'],
        emits: ['update:modelValue', 'keyup.enter'],
      },
    },
  },
};

function mountDrawer() {
  return mount(ChatDrawer, mountOptions);
}

describe('ChatDrawer.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMessages.value = [];
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza o componente sem erros', () => {
    const wrapper = mountDrawer();

    expect(wrapper.exists()).toBe(true);
  });

  it('exibe o título Terminal', () => {
    const wrapper = mountDrawer();

    expect(wrapper.text()).toContain('Terminal');
  });

  it('exibe mensagem de estado vazio quando não há mensagens', () => {
    const wrapper = mountDrawer();

    expect(wrapper.text()).toContain('Nenhuma mensagem ainda');
  });

  it('renderiza as mensagens quando há dados', async () => {
    mockMessages.value = [
      {
        id: '1',
        type: 'user-command',
        timestamp: new Date().toISOString(),
        content: '/roll 2d6',
      },
      {
        id: '2',
        type: 'roll-result',
        timestamp: new Date().toISOString(),
        content: 'Resultado: 8',
      },
    ];

    const wrapper = mountDrawer();
    await nextTick();

    expect(wrapper.text()).toContain('/roll 2d6');
    expect(wrapper.text()).toContain('Resultado: 8');
  });

  it('aplica a classe correta para diferentes tipos de mensagem', async () => {
    mockMessages.value = [
      {
        id: '1',
        type: 'user-command',
        timestamp: new Date().toISOString(),
        content: 'teste',
      },
    ];

    const wrapper = mountDrawer();
    await nextTick();

    const bubble = wrapper.find('.message-bubble');
    expect(bubble.classes()).toContain('message-user-command');
  });

  it('emite update:modelValue quando botão close é clicado', async () => {
    const wrapper = mount(ChatDrawer, {
      props: { modelValue: true },
      global: {
        plugins: [],
        stubs: {
          QDrawer: { template: '<div><slot /></div>' },
          QBtn: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            emits: ['click'],
          },
          QInput: { template: '<input />' },
        },
      },
    });

    const closeBtn = wrapper.find('.close-btn');
    await closeBtn.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeDefined();
  });

  it('envia o comando quando Enter é pressionado', async () => {
    vi.useFakeTimers();
    const wrapper = mountDrawer();

    const input = wrapper.find('input');
    await input.setValue('/roll 1d8');
    await input.trigger('keyup.enter');

    expect(mockSendCommand).toHaveBeenCalledWith('/roll 1d8');
  });

  it('limpa o campo de input após enviar', async () => {
    vi.useFakeTimers();
    const wrapper = mountDrawer();

    const input = wrapper.find('input') as any;
    await input.setValue('/roll 1d6');
    await input.trigger('keyup.enter');
    await flushPromises();

    expect((input.element as HTMLInputElement).value).toBe('');
  });

  it('não envia comando se o input estiver vazio', async () => {
    vi.useFakeTimers();
    const wrapper = mountDrawer();

    const input = wrapper.find('input');
    await input.setValue('');
    await input.trigger('keyup.enter');

    expect(mockSendCommand).not.toHaveBeenCalled();
  });

  it('não envia comando se o input contiver apenas espaços', async () => {
    vi.useFakeTimers();
    const wrapper = mountDrawer();

    const input = wrapper.find('input');
    await input.setValue('   ');
    await input.trigger('keyup.enter');

    expect(mockSendCommand).not.toHaveBeenCalled();
  });

  it('formata o timestamp corretamente para exibição', async () => {
    const now = new Date();
    mockMessages.value = [
      {
        id: '1',
        type: 'user-command',
        timestamp: now.toISOString(),
        content: 'teste',
      },
    ];

    const wrapper = mountDrawer();
    await nextTick();

    const timestamp = wrapper.find('.message-timestamp');
    expect(timestamp.exists()).toBe(true);
    expect(timestamp.text()).toMatch(/\d{2}:\d{2}:\d{2}/); // HH:MM:SS format
  });
});
