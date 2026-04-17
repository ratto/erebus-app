import { onMounted, onUnmounted } from 'vue';
import { useChatStore } from 'src/stores/chat';
import { DiceGateway } from 'src/model/gateways/dice.gateway';

const VALID_DICE = ['d3', 'd4', 'd6', 'd8', 'd10', 'd12', 'd100'] as const;

interface ParsedRoll {
  diceType: string;
  count: number;
}

function parseRollCommand(input: string): ParsedRoll | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^\/roll(?:\s+(\d+)d(\d+))?$/i);

  if (!match) return null;

  if (!match[1] && !match[2]) {
    return { diceType: 'd100', count: 1 };
  }

  const count = parseInt(match[1]!, 10);
  const diceType = `d${match[2]}`;

  if (!VALID_DICE.includes(diceType as (typeof VALID_DICE)[number])) {
    return null;
  }

  return { diceType, count };
}

export const useChat = () => {
  const chatStore = useChatStore();
  const gateway = DiceGateway();

  let eventSource: EventSource | null = null;

  function connectSSE() {
    const url = import.meta.env.VITE_LOGS_STREAM_URL as string;
    eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        chatStore.addMessage({
          timestamp: (data.timestamp as string) ?? new Date().toISOString(),
          type: 'server-event',
          content: `[${data.event as string}] ${JSON.stringify(data.payload)}`,
          payload: data.payload,
        });
      } catch {
        // silently ignore malformed messages
      }
    };

    eventSource.onerror = () => {
      // EventSource reconecta automaticamente — não é necessário tratar aqui
    };
  }

  function disconnectSSE() {
    eventSource?.close();
    eventSource = null;
  }

  async function sendCommand(input: string): Promise<void> {
    const trimmed = input.trim();

    if (!trimmed.startsWith('/')) {
      chatStore.addMessage({
        timestamp: new Date().toISOString(),
        type: 'user-command',
        content: trimmed,
      });
      return;
    }

    if (trimmed.startsWith('/roll')) {
      chatStore.addMessage({
        timestamp: new Date().toISOString(),
        type: 'user-command',
        content: trimmed,
      });

      const parsed = parseRollCommand(trimmed);

      if (!parsed) {
        chatStore.addMessage({
          timestamp: new Date().toISOString(),
          type: 'error',
          content:
            'Formato inválido. Use: /roll, /roll 2d6, /roll 1d8. Dados válidos: d3, d4, d6, d8, d10, d12, d100',
        });
        return;
      }

      try {
        const result = await gateway.rollDice(parsed.diceType, parsed.count);
        chatStore.addMessage({
          timestamp: new Date().toISOString(),
          type: 'roll-result',
          content: `${parsed.count}${parsed.diceType}: [${result.results.join(', ')}] = ${result.total}`,
          payload: result,
        });
      } catch {
        chatStore.addMessage({
          timestamp: new Date().toISOString(),
          type: 'error',
          content: 'Erro ao contatar a API. Verifique se o servidor está ativo.',
        });
      }
      return;
    }

    chatStore.addMessage({
      timestamp: new Date().toISOString(),
      type: 'error',
      content: `Comando desconhecido: ${trimmed}. Comandos disponíveis: /roll`,
    });
  }

  onMounted(() => {
    connectSSE();
  });

  onUnmounted(() => {
    disconnectSSE();
  });

  return {
    messages: chatStore.messages,
    sendCommand,
    clearMessages: chatStore.clearMessages,
  };
};
