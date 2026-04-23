<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="settings-card">
      <div class="settings-header">
        <span class="settings-title">{{ $t('settings.title') }}</span>
        <q-btn
          flat
          dense
          round
          icon="close"
          class="close-btn"
          data-testid="btn-close-settings"
          @click="$emit('update:modelValue', false)"
        />
      </div>

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
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfigStore } from 'src/stores/config.store';

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
.settings-card {
  background: var(--void-800);
  border: 1px solid rgba(232, 93, 26, 0.2);
  border-radius: var(--radius-lg);
  min-width: 320px;
  max-width: 420px;
  width: 100%;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-3) var(--sp-4);
  background: var(--void-900);
  border-bottom: 1px solid rgba(232, 93, 26, 0.2);
}

.settings-title {
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ember-300);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.close-btn {
  color: var(--bone-600);

  &:hover {
    color: var(--bone-800);
  }
}

.settings-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-4);
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
