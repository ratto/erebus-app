<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card class="item-form-dialog">
      <q-card-section class="dialog-header">
        <div class="text-h6 dialog-title">
          {{ mode === 'create' ? t('pages.items.dialog.titleCreate') : t('pages.items.dialog.titleEdit') }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form ref="formRef" class="q-gutter-sm">
          <q-input
            v-model="form.name"
            :label="t('pages.items.dialog.fieldName')"
            :rules="nameRules"
            maxlength="80"
            counter
            dense
            outlined
            autofocus
            data-testid="input-item-name"
          />

          <q-select
            v-model="form.type"
            :options="typeOptions"
            :label="t('pages.items.dialog.fieldType')"
            :rules="typeRules"
            emit-value
            map-options
            dense
            outlined
            data-testid="select-item-type"
          />

          <q-input
            v-model="form.description"
            :label="t('pages.items.dialog.fieldDescription')"
            :rules="descriptionRules"
            maxlength="500"
            counter
            type="textarea"
            rows="3"
            dense
            outlined
            data-testid="input-item-description"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          :label="t('pages.items.dialog.cancel')"
          color="grey"
          @click="handleCancel"
          data-testid="btn-cancel"
        />
        <q-btn
          unelevated
          :label="t('pages.items.dialog.save')"
          color="primary"
          :disable="!isValid"
          @click="handleConfirm"
          data-testid="btn-save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QForm } from 'quasar';
import type { Item, ItemInput, ItemType } from 'src/model/types/item.type';

interface Props {
  modelValue: boolean;
  mode: 'create' | 'edit';
  item?: Item;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [input: ItemInput];
}>();

const { t } = useI18n();
const formRef = ref<QForm | null>(null);

const emptyForm = (): { name: string; type: ItemType | null; description: string } => ({
  name: '',
  type: null,
  description: '',
});

const form = ref(emptyForm());

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.mode === 'edit' && props.item) {
        form.value = { name: props.item.name, type: props.item.type, description: props.item.description };
      } else {
        form.value = emptyForm();
      }
    }
  },
  { immediate: true },
);

const typeOptions = computed(() => [
  { label: t('pages.items.typeOptions.mundane'), value: 'mundane' },
  { label: t('pages.items.typeOptions.consumable'), value: 'consumable' },
]);

const nameRules = [
  (val: string) => (val && val.trim().length > 0) || t('pages.items.dialog.validation.nameRequired'),
  (val: string) => val.length <= 80 || t('pages.items.dialog.validation.nameMaxLength'),
];

const typeRules = [
  (val: string | null) => !!val || t('pages.items.dialog.validation.typeRequired'),
];

const descriptionRules = [
  (val: string) => val.length <= 500 || t('pages.items.dialog.validation.descriptionMaxLength'),
];

const isValid = computed(() => {
  const name = form.value.name.trim();
  return name.length > 0 && name.length <= 80 && !!form.value.type && form.value.description.length <= 500;
});

async function handleConfirm(): Promise<void> {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  emit('confirm', {
    name: form.value.name.trim(),
    type: form.value.type as ItemType,
    description: form.value.description,
  });
}

function handleCancel(): void {
  emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">
.item-form-dialog {
  min-width: 380px;
  max-width: 520px;
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
</style>
