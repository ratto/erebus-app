<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="persistent"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card :class="`erebus-dialog-card erebus-dialog-card--${type}`">
      <div class="erebus-dialog-header">
        <q-icon :name="variantConfig.icon" :class="`erebus-dialog-icon erebus-dialog-icon--${type}`" />
        <span class="erebus-dialog-title" data-testid="dialog-title">{{ title }}</span>
        <q-btn
          v-if="!persistent"
          round
          flat
          icon="close"
          class="erebus-dialog-close"
          data-testid="btn-close"
          @click="handleClose"
        />
      </div>

      <div class="erebus-dialog-body">
        <slot>
          <p v-if="message" class="erebus-dialog-message">{{ message }}</p>
        </slot>
      </div>

      <div class="erebus-dialog-actions">
        <q-btn
          v-if="!hideCancelButton"
          flat
          :label="cancelLabel"
          class="btn-ghost"
          data-testid="btn-cancel"
          @click="handleCancel"
        />
        <q-btn
          unelevated
          :label="confirmLabel"
          :class="`${variantConfig.confirmClass}`"
          :disable="disableConfirm"
          data-testid="btn-confirm"
          @click="handleConfirm"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type DialogType = 'info' | 'warning' | 'danger' | 'success'

interface ErebusDialogProps {
  modelValue: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  hideCancelButton?: boolean
  disableConfirm?: boolean
  type?: DialogType
  persistent?: boolean
}

interface VariantConfig {
  icon: string
  confirmClass: string
}

const props = withDefaults(defineProps<ErebusDialogProps>(), {
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  hideCancelButton: false,
  disableConfirm: false,
  type: 'info',
  persistent: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const variantMap: Record<DialogType, VariantConfig> = {
  info: { icon: 'info', confirmClass: 'btn-primary' },
  warning: { icon: 'warning', confirmClass: 'btn-warning' },
  danger: { icon: 'warning', confirmClass: 'btn-danger' },
  success: { icon: 'check_circle', confirmClass: 'btn-success' },
}

const variantConfig = computed(() => variantMap[props.type])

function handleClose(): void {
  emit('update:modelValue', false)
}

function handleCancel(): void {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleConfirm(): void {
  emit('confirm')
}
</script>

<style scoped lang="scss">
.erebus-dialog-card {
  background: var(--void-800);
  border-radius: var(--radius-lg);
  min-width: 320px;
  max-width: 480px;
  width: 100%;

  &--info {
    border: 1px solid rgba(37, 136, 174, 0.2);
  }

  &--warning {
    border: 1px solid rgba(176, 126, 0, 0.2);
  }

  &--danger {
    border: 1px solid rgba(196, 34, 56, 0.2);
  }

  &--success {
    border: 1px solid rgba(37, 138, 74, 0.2);
  }
}

.erebus-dialog-header {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  background: var(--void-900);
  border-bottom: 1px solid var(--void-600);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.erebus-dialog-icon {
  font-size: 1.25rem;

  &--info {
    color: var(--mist-400);
  }

  &--warning {
    color: var(--brimstone-400);
  }

  &--danger {
    color: var(--ichor-400);
  }

  &--success {
    color: var(--verdant-400);
  }
}

.erebus-dialog-title {
  flex: 1;
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ember-300);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.erebus-dialog-close {
  color: var(--bone-600);

  &:hover {
    color: var(--bone-800);
  }
}

.erebus-dialog-body {
  padding: var(--sp-4);
}

.erebus-dialog-message {
  color: var(--bone-600);
  margin: 0;
  font-family: var(--font-body);
}

.erebus-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4) var(--sp-4);
}
</style>
