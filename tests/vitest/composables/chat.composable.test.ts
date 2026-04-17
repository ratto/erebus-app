/**
 * Testa o parser /roll e o fluxo sendCommand do chat.composable.
 *
 * parseRollCommand é uma função privada do composable; validamos seu comportamento
 * indiretamente por meio de sendCommand, verificando:
 *  - quais argumentos chegam ao DiceGateway (formatos válidos)
 *  - quais mensagens de erro são adicionadas ao store (formatos inválidos)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApp, h } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

// ── Mocks (devem ser declarados antes dos imports que os consomem) ─────────────

const { mockRollDice } = vi.hoisted(() => ({
  mockRollDice: vi.fn<(diceType: string, count: number) => Promise<{ results: number[]; total: number }>>(),
}));

vi.mock('src/model/gateways/dice.gateway', () => ({
  DiceGateway: () => ({ rollDice: mockRollDice }),
}));

// EventSource não existe em jsdom — stub global antes de qualquer importação do composable.
// A implementação usa 'function' (não arrow function) para que o mock seja compatível com `new`.
vi.stubGlobal(
  'EventSource',
  vi.fn(function (this: Record<string, unknown>) {
    this['onmessage'] = null;
    this['onerror'] = null;
    this['close'] = vi.fn();
  }),
);

// ── Imports pós-mock ──────────────────────────────────────────────────────────

import { useChat } from 'src/composables/chat.composable';
import { useChatStore } from 'src/stores/chat';

// ── Helper: monta o composable com ciclo de vida Vue + Pinia ──────────────────

function setupChat() {
  let chatComposable!: ReturnType<typeof useChat>;
  const pinia = createPinia();
  setActivePinia(pinia);

  const app = createApp({
    setup() {
      chatComposable = useChat();
      return () => h('div');
    },
  });
  app.use(pinia);
  app.mount(document.createElement('div'));

  const store = useChatStore();
  return { chat: chatComposable, store, app };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('useChat — parser /roll (via sendCommand)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRollDice.mockResolvedValue({ results: [50], total: 50 });
    vi.stubEnv('VITE_LOGS_STREAM_URL', 'http://localhost:3000/api/v1/logs/stream');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // ── Teste 6: /roll sem args → d100, count 1 ──────────────────────────────────

  it('/roll sem argumentos → chama rollDice com diceType "d100" e count 1', async () => {
    const { chat } = setupChat();

    await chat.sendCommand('/roll');

    expect(mockRollDice).toHaveBeenCalledOnce();
    expect(mockRollDice).toHaveBeenCalledWith('d100', 1);
  });

  // ── Teste 7: /roll 2d6 → d6, count 2 ────────────────────────────────────────

  it('/roll 2d6 → chama rollDice com diceType "d6" e count 2', async () => {
    const { chat } = setupChat();

    await chat.sendCommand('/roll 2d6');

    expect(mockRollDice).toHaveBeenCalledOnce();
    expect(mockRollDice).toHaveBeenCalledWith('d6', 2);
  });

  // ── Teste 8: /roll 1d8 → d8, count 1 ────────────────────────────────────────

  it('/roll 1d8 → chama rollDice com diceType "d8" e count 1', async () => {
    const { chat } = setupChat();

    await chat.sendCommand('/roll 1d8');

    expect(mockRollDice).toHaveBeenCalledOnce();
    expect(mockRollDice).toHaveBeenCalledWith('d8', 1);
  });

  // ── Teste 9: /roll 3d20 → dado inválido, erro no chat ────────────────────────

  it('/roll 3d20 → dado não suportado, adiciona mensagem de erro no chat sem chamar a API', async () => {
    const { chat, store } = setupChat();

    await chat.sendCommand('/roll 3d20');

    // d20 não está na lista de dados válidos — não deve chamar a API
    expect(mockRollDice).not.toHaveBeenCalled();

    // Deve haver uma mensagem do tipo 'error' com conteúdo explicativo
    const errorMsg = store.messages.find((m) => m.type === 'error');
    expect(errorMsg).toBeDefined();
    expect(errorMsg!.content).toMatch(/[Ff]ormato|[Ii]nválido|[Vv]álidos|d3|d100/);
  });

  // ── Teste 10: /roll abc → formato inválido, erro no chat ─────────────────────

  it('/roll abc → formato inválido, adiciona mensagem de erro no chat sem chamar a API', async () => {
    const { chat, store } = setupChat();

    await chat.sendCommand('/roll abc');

    expect(mockRollDice).not.toHaveBeenCalled();

    const errorMsg = store.messages.find((m) => m.type === 'error');
    expect(errorMsg).toBeDefined();
    expect(errorMsg!.type).toBe('error');
  });

  // ── Testes complementares ─────────────────────────────────────────────────────

  it('roll válido adiciona mensagem roll-result ao store com conteúdo formatado', async () => {
    mockRollDice.mockResolvedValueOnce({ results: [4, 2], total: 6 });
    const { chat, store } = setupChat();

    await chat.sendCommand('/roll 2d6');

    const resultMsg = store.messages.find((m) => m.type === 'roll-result');
    expect(resultMsg).toBeDefined();
    expect(resultMsg!.content).toContain('2d6');
    expect(resultMsg!.content).toContain('6'); // total
  });

  it('roll válido adiciona primeiro mensagem user-command depois roll-result', async () => {
    const { chat, store } = setupChat();

    await chat.sendCommand('/roll 1d8');

    const types = store.messages.map((m) => m.type);
    expect(types).toContain('user-command');
    expect(types).toContain('roll-result');
    // user-command deve vir antes de roll-result
    expect(types.indexOf('user-command')).toBeLessThan(types.indexOf('roll-result'));
  });
});
