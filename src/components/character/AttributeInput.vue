<template>
  <div class="attribute-input">
    <q-input
      :model-value="modelValue"
      @update:model-value="onUpdate"
      type="number"
      :label="label"
      dense
      outlined
      :min="5"
      :max="20"
      input-class="text-center"
      class="attr-input"
    >
      <template #append>
        <q-icon name="info" size="xs" class="cursor-pointer text-bone-600">
          <q-tooltip>{{ tooltip }}</q-tooltip>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number;
  label: string;
  tooltip?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

function onUpdate(val: string | number | null): void {
  const num = Number(val);
  if (!isNaN(num)) {
    emit('update:modelValue', num);
  }
}
</script>

<style scoped lang="scss">
.attribute-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
}

.attr-input {
  width: 80px;
}
</style>
