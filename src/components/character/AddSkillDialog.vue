<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="erebus-card dialog-card">
      <q-card-section class="card-header">
        {{ t('pages.character.dialog.selectSkill') }}
      </q-card-section>

      <q-card-section class="card-body q-gutter-md">
        <q-select
          v-model="selectedSkill"
          :options="skillOptions"
          option-label="nome"
          option-value="id"
          :label="t('pages.character.dialog.selectSkill')"
          dense
          outlined
          emit-value
          map-options
        />

        <q-input
          v-model.number="points"
          type="number"
          :label="t('pages.character.dialog.points')"
          :min="10"
          :max="50"
          dense
          outlined
        />
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
          :disable="!canConfirm"
          @click="confirm"
          class="btn-primary"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CharacterSkill } from 'src/model/types/character.type';

interface SkillOption {
  id: number;
  nome: string;
}

defineProps<{
  modelValue: boolean;
  skillOptions: SkillOption[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  add: [skill: CharacterSkill];
}>();

const { t } = useI18n();

const selectedSkill = ref<SkillOption | null>(null);
const points = ref<number>(10);

const canConfirm = computed(
  () => selectedSkill.value !== null && points.value >= 10 && points.value <= 50,
);

function confirm(): void {
  if (!selectedSkill.value) return;

  emit('add', {
    id: selectedSkill.value.id,
    nome: selectedSkill.value.nome,
    pontos: points.value,
  });

  selectedSkill.value = null;
  points.value = 10;
  emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">
.dialog-card {
  min-width: 320px;
}
</style>
