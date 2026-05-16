<template>
  <ErebusDialog
    :model-value="modelValue"
    :title="t('pages.items.deleteDialog.title')"
    :confirm-label="t('pages.items.deleteDialog.confirm')"
    :cancel-label="t('pages.items.deleteDialog.cancel')"
    type="danger"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="handleConfirm"
    @cancel="$emit('update:modelValue', false)"
  >
    <p class="delete-message">
      {{ t('pages.items.deleteDialog.message') }}
      <strong class="item-name">{{ item.name }}</strong>?
    </p>
  </ErebusDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Item } from 'src/model/types/item.type';
import ErebusDialog from 'src/components/common/ErebusDialog.vue';

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
.delete-message {
  color: var(--bone-600);
  margin: 0;
}

.item-name {
  color: var(--bone-200);
}
</style>
