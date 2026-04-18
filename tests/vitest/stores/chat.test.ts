import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useChatStore } from 'src/stores/chat';

describe('useChatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // ── addMessage() ──────────────────────────────────────────────────────────────

  describe('addMessage()', () => {
    it('adiciona mensagem ao array com id gerado automaticamente', () => {
      const store = useChatStore();

      store.addMessage({
        timestamp: '2026-01-01T00:00:00.000Z',
        type: 'user-command',
        content: '/roll',
      });

      expect(store.messages).toHaveLength(1);
      const msg = store.messages[0]!;
      expect(typeof msg.id).toBe('string');
      expect(msg.id.length).toBeGreaterThan(0);
      expect(msg.content).toBe('/roll');
      expect(msg.type).toBe('user-command');
      expect(msg.timestamp).toBe('2026-01-01T00:00:00.000Z');
    });

    it('preserva o payload opcional quando fornecido', () => {
      const store = useChatStore();
      const payload = { results: [4], total: 4 };

      store.addMessage({
        timestamp: new Date().toISOString(),
        type: 'roll-result',
        content: '1d6: [4] = 4',
        payload,
      });

      expect(store.messages[0]!.payload).toEqual(payload);
    });

    it('gera ids únicos para cada mensagem adicionada', () => {
      const store = useChatStore();

      store.addMessage({ timestamp: new Date().toISOString(), type: 'user-command', content: 'a' });
      store.addMessage({ timestamp: new Date().toISOString(), type: 'user-command', content: 'b' });

      const ids = store.messages.map((m) => m.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('acumula múltiplas mensagens na ordem de inserção', () => {
      const store = useChatStore();

      store.addMessage({ timestamp: new Date().toISOString(), type: 'user-command', content: 'primeiro' });
      store.addMessage({ timestamp: new Date().toISOString(), type: 'server-event', content: 'segundo' });
      store.addMessage({ timestamp: new Date().toISOString(), type: 'error', content: 'terceiro' });

      expect(store.messages).toHaveLength(3);
      expect(store.messages[0]!.content).toBe('primeiro');
      expect(store.messages[1]!.content).toBe('segundo');
      expect(store.messages[2]!.content).toBe('terceiro');
    });
  });

  // ── clearMessages() ───────────────────────────────────────────────────────────

  describe('clearMessages()', () => {
    it('esvazia o array de mensagens', () => {
      const store = useChatStore();

      store.addMessage({ timestamp: new Date().toISOString(), type: 'user-command', content: 'a' });
      store.addMessage({ timestamp: new Date().toISOString(), type: 'server-event', content: 'b' });

      store.clearMessages();

      expect(store.messages).toHaveLength(0);
    });

    it('não lança erro quando o array já está vazio', () => {
      const store = useChatStore();

      expect(() => store.clearMessages()).not.toThrow();
      expect(store.messages).toHaveLength(0);
    });

    it('mensagens adicionadas após clearMessages aparecem normalmente', () => {
      const store = useChatStore();

      store.addMessage({ timestamp: new Date().toISOString(), type: 'user-command', content: 'antes' });
      store.clearMessages();
      store.addMessage({ timestamp: new Date().toISOString(), type: 'user-command', content: 'depois' });

      expect(store.messages).toHaveLength(1);
      expect(store.messages[0]!.content).toBe('depois');
    });
  });
});
