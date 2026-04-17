import { defineStore } from 'pinia';
import { ref } from 'vue';
import { uid } from 'quasar';

export interface ChatMessage {
  id: string;
  timestamp: string;
  type: 'user-command' | 'roll-result' | 'server-event' | 'error';
  content: string;
  payload?: unknown;
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([]);

  function addMessage(message: Omit<ChatMessage, 'id'>): void {
    messages.value.push({
      id: uid(),
      ...message,
    });
  }

  function clearMessages(): void {
    messages.value = [];
  }

  return {
    messages,
    addMessage,
    clearMessages,
  };
});
