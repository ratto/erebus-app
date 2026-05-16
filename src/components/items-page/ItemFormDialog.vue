<template>
  <ErebusDialog
    :model-value="modelValue"
    :title="mode === 'create' ? t('pages.items.dialog.titleCreate') : t('pages.items.dialog.titleEdit')"
    :confirm-label="t('pages.items.dialog.save')"
    :cancel-label="t('pages.items.dialog.cancel')"
    :disable-confirm="!isValid"
    :persistent="true"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <q-form ref="formRef" class="item-form q-gutter-sm">
      <ErebusInput
        v-model="form.name"
        :inner-class="'item-form-input'"
        data-testid="input-item-name"
      />

      <ErebusSelect
        v-model="form.type"
        :options="typeOptions"
        data-testid="select-item-type"
      />

      <ErebusInput
        v-model="form.description"
        :inner-class="'item-form-input'"
        data-testid="input-item-description"
      />
    </q-form>
  </ErebusDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QForm } from 'quasar';
import type { Item, ItemInput, ItemType } from 'src/model/types/item.type';
import ErebusDialog from 'src/components/common/ErebusDialog.vue';
import ErebusInput from 'src/components/common/ErebusInput.vue';
import ErebusSelect from 'src/components/common/ErebusSelect.vue';

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
.item-form {
  min-width: 380px;
  max-width: 520px;
}
</style>
