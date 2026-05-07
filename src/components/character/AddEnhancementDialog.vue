<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="erebus-card dialog-card">
      <q-card-section class="card-header">
        {{ t('pages.character.dialog.selectEnhancement') }}
      </q-card-section>

      <q-card-section class="card-body">
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
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="t('pages.character.dialog.cancel')"
          @click="$emit('update:modelValue', false)"
          class="btn-ghost"
        />
        <q-btn
          :label="t('pages.character.dialog.confirm')"
          :disable="selectedEnhancement === null"
          @click="confirm"
          class="btn-primary"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CharacterEnhancement } from 'src/model/types/character.type';

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
.dialog-card {
  min-width: 360px;
}
</style>
