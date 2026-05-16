<template>
  <ErebusDialog
    :model-value="modelValue"
    :title="$t('settings.title')"
    :hide-cancel-button="true"
    confirm-label="OK"
    type="info"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="$emit('update:modelValue', false)"
  >
    <div class="settings-body">
      <q-select
        :model-value="configStore.locale"
        :options="localeOptions"
        :label="$t('settings.language')"
        outlined
        dense
        dark
        emit-value
        map-options
        class="settings-select"
        @update:model-value="configStore.setLocale($event)"
      />

      <q-select
        :model-value="configStore.campaignScenario"
        :options="scenarioOptions"
        :label="$t('settings.campaignScenario')"
        outlined
        dense
        dark
        emit-value
        map-options
        class="settings-select"
        @update:model-value="configStore.setCampaignScenario($event)"
      />

      <q-select
        :model-value="configStore.gameType"
        :options="gameTypeOptions"
        :label="$t('settings.gameType')"
        outlined
        dense
        dark
        emit-value
        map-options
        class="settings-select"
        @update:model-value="configStore.setGameType($event)"
      />
    </div>
  </ErebusDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfigStore } from 'src/stores/config.store';
import ErebusDialog from 'src/components/common/ErebusDialog.vue';

defineProps<{ modelValue: boolean }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();

const configStore = useConfigStore();
const { t } = useI18n();

const localeOptions = computed(() => [
  { label: 'Português (BR)', value: 'pt-BR' },
  { label: 'English (US)', value: 'en-US' },
]);

const scenarioOptions = computed(() => [
  { label: t('settings.scenarios.contemporary'), value: 'contemporary' },
  { label: t('settings.scenarios.medieval'), value: 'medieval' },
  { label: t('settings.scenarios.futuristic'), value: 'futuristic' },
]);

const gameTypeOptions = computed(() => [
  { label: t('settings.gameTypes.action'), value: 'action' },
  { label: t('settings.gameTypes.turn_based'), value: 'turn_based' },
]);
</script>

<style scoped lang="scss">
.settings-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.settings-select {
  :deep(.q-field__control) {
    background: var(--void-700);
    border-color: rgba(232, 93, 26, 0.2);
  }

  :deep(.q-field__label) {
    color: var(--bone-600);
  }

  :deep(.q-field__native) {
    color: var(--bone-800);
  }
}
</style>
