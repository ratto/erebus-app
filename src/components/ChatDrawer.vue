<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    side="right"
    :width="360"
    overlay
    behavior="mobile"
    class="chat-drawer"
  >
    <div class="chat-container">
      <div class="chat-header">
        <span class="chat-title">Terminal</span>
        <q-btn
          flat
          dense
          round
          icon="close"
          @click="$emit('update:modelValue', false)"
          class="close-btn"
        />
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message-bubble', `message-${msg.type}`]"
        >
          <span class="message-timestamp">{{ formatTimestamp(msg.timestamp) }}</span>
          <span class="message-content">{{ msg.content }}</span>
        </div>
        <div v-if="messages.length === 0" class="empty-state">
          Nenhuma mensagem ainda. Digite /roll para rolar dados.
        </div>
      </div>

      <div class="chat-input-area">
        <q-input
          v-model="inputText"
          dense
          filled
          dark
          placeholder="Digite um comando ou /roll 2d6"
          @keyup.enter="handleSend"
          class="chat-input"
        />
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useChat } from 'src/composables/chat.composable';

defineProps<{ modelValue: boolean }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();

const { messages, sendCommand } = useChat();
const inputText = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

async function handleSend() {
  const text = inputText.value.trim();
  if (!text) return;
  inputText.value = '';
  await sendCommand(text);
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

watch(
  messages,
  async () => {
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.chat-drawer {
  background: var(--void-800);
  border-left: 1px solid rgba(232, 93, 26, 0.15);
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-3) var(--sp-4);
  background: var(--void-900);
  border-bottom: 1px solid rgba(232, 93, 26, 0.2);
  flex-shrink: 0;
}

.chat-title {
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ember-300);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.close-btn {
  color: var(--bone-600);

  &:hover {
    color: var(--bone-800);
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-3) var(--sp-4);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  scrollbar-width: thin;
  scrollbar-color: var(--void-500) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--void-500);
    border-radius: var(--radius-lg);
  }
}

.message-bubble {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.5;
  border-left: 2px solid transparent;

  &.message-user-command {
    background: var(--void-600);
    border-left-color: var(--bone-600);
    color: var(--bone-700);
  }

  &.message-roll-result {
    background: rgba(232, 93, 26, 0.08);
    border-left-color: var(--ember-400);
    color: var(--ember-200);
  }

  &.message-server-event {
    background: rgba(98, 89, 212, 0.08);
    border-left-color: var(--rune-400);
    color: var(--rune-300);
  }

  &.message-error {
    background: rgba(196, 34, 56, 0.08);
    border-left-color: var(--ichor-400);
    color: #e05070;
  }
}

.message-timestamp {
  color: var(--bone-500);
  font-size: 0.65rem;
}

.message-content {
  word-break: break-word;
}

.empty-state {
  color: var(--bone-500);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-align: center;
  margin-top: var(--sp-8);
  font-style: italic;
}

.chat-input-area {
  padding: var(--sp-3) var(--sp-4);
  border-top: 1px solid rgba(232, 93, 26, 0.15);
  flex-shrink: 0;
}

.chat-input {
  :deep(.q-field__control) {
    background: var(--void-700);
    border: 1px solid rgba(232, 93, 26, 0.2);
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--bone-800);

    &:focus-within {
      border-color: var(--ember-400);
    }
  }

  :deep(.q-field__native) {
    color: var(--bone-800);
  }

  :deep(.q-field__native::placeholder) {
    color: var(--bone-500);
  }
}
</style>
