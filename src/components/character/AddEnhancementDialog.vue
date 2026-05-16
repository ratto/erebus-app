<template>
  <ErebusDialog
    :model-value="modelValue"
    :title="t('pages.character.dialog.selectEnhancement')"
    :confirm-label="t('pages.character.dialog.confirm')"
    :cancel-label="t('pages.character.dialog.cancel')"
    :disable-confirm="selectedEnhancement === null"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="confirm"
    @cancel="$emit('update:modelValue', false)"
  >
    <div class="add-enhancement-body">
      <q-select
        v-model="selectedEnhancement"
        :options="enhancementOptions"
        option-label="nome"
        option-value="id"
        :label="t('pages.character.dialog.selectEnhancement')"
        dense
        outlined
        emit-value
        map-options
        data-testid="select-enhancement"
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.nome }}</q-item-label>
              <q-item-label caption>
                <span :class="scope.opt.custo >= 0 ? 'text-positive' : 'text-negative'">
                  {{ scope.opt.custo > 0 ? '+' : '' }}{{ scope.opt.custo }} PA
                </span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
  </ErebusDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CharacterEnhancement } from 'src/model/types/character.type';
import ErebusDialog from 'src/components/common/ErebusDialog.vue';

interface EnhancementOption {
  id: number;
  nome: string;
  custo: number;
}

defineProps<{
  modelValue: boolean;
  enhancementOptions: EnhancementOption[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  add: [enhancement: CharacterEnhancement];
}>();

const { t } = useI18n();

const selectedEnhancement = ref<EnhancementOption | null>(null);

function confirm(): void {
  if (!selectedEnhancement.value) return;

  emit('add', {
    id: selectedEnhancement.value.id,
    nome: selectedEnhancement.value.nome,
    custo: selectedEnhancement.value.custo,
  });

  selectedEnhancement.value = null;
  emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">
.add-enhancement-body {
  min-width: 360px;
}
</style>
