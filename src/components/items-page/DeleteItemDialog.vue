<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="delete-item-dialog">
      <q-card-section class="dialog-header">
        <div class="text-h6 dialog-title">{{ t('pages.items.deleteDialog.title') }}</div>
      </q-card-section>

      <q-card-section>
        <p class="delete-message">
          {{ t('pages.items.deleteDialog.message') }}
          <strong class="item-name">{{ item.name }}</strong>?
        </p>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          :label="t('pages.items.deleteDialog.cancel')"
          color="grey"
          @click="$emit('update:modelValue', false)"
          data-testid="btn-delete-cancel"
        />
        <q-btn
          unelevated
          :label="t('pages.items.deleteDialog.confirm')"
          color="negative"
          @click="handleConfirm"
          data-testid="btn-delete-confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Item } from 'src/model/types/item.type';

interface Props {
  modelValue: boolean;
  item: Item;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const { t } = useI18n();

function handleConfirm(): void {
  emit('confirm');
  emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">
.delete-item-dialog {
  min-width: 320px;
  max-width: 440px;
  width: 100%;
  background: var(--void-700);
  border: 1px solid rgba(232, 93, 26, 0.2);
}

.dialog-header {
  background: var(--void-800);
  border-bottom: 1px solid rgba(232, 93, 26, 0.15);
}

.dialog-title {
  font-family: var(--font-heading);
  color: var(--ember-300);
  letter-spacing: 0.05em;
  font-size: 0.875rem;
}

.delete-message {
  color: var(--bone-600);
  margin: 0;
}

.item-name {
  color: var(--bone-200);
}
</style>
