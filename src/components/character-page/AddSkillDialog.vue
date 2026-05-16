<template>
  <ErebusDialog
    :model-value="modelValue"
    :title="t('pages.character.dialog.selectSkill')"
    :confirm-label="t('pages.character.dialog.confirm')"
    :cancel-label="t('pages.character.dialog.cancel')"
    :disable-confirm="!canConfirm"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="confirm"
    @cancel="$emit('update:modelValue', false)"
  >
    <div class="add-skill-body q-gutter-md">
      <ErebusSelect
        v-model="selectedSkillId"
        :options="skillBaseOptions"
        data-testid="select-skill"
      />

      <q-input
        v-model.number="points"
        type="number"
        :label="t('pages.character.dialog.points')"
        :min="10"
        :max="50"
        dense
        outlined
        data-testid="input-skill-points"
      />
    </div>
  </ErebusDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CharacterSkill } from 'src/model/types/character.type';
import ErebusDialog from 'src/components/common/ErebusDialog.vue';
import ErebusSelect from 'src/components/common/ErebusSelect.vue';

interface SkillOption {
  id: number;
  nome: string;
}

const props = defineProps<{
  modelValue: boolean;
  skillOptions: SkillOption[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  add: [skill: CharacterSkill];
}>();

const { t } = useI18n();

const selectedSkillId = ref<number | null>(null);
const points = ref<number>(10);

const selectedSkill = computed(() =>
  props.skillOptions.find((s) => s.id === selectedSkillId.value) ?? null,
);

const skillBaseOptions = computed(() =>
  props.skillOptions.map((s) => ({ label: s.nome, value: s.id })),
);

const canConfirm = computed(
  () => selectedSkillId.value !== null && points.value >= 10 && points.value <= 50,
);

function confirm(): void {
  if (!selectedSkill.value) return;

  emit('add', {
    id: selectedSkill.value.id,
    nome: selectedSkill.value.nome,
    pontos: points.value,
  });

  selectedSkillId.value = null;
  points.value = 10;
  emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">
.add-skill-body {
  min-width: 320px;
}
</style>
