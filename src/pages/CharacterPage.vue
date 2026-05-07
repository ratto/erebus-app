<template>
  <q-page id="character-page" class="erebus-page q-pa-md" data-testid="character-container">
    <h1>{{ t('pages.character.title') }}</h1>
    <div class="subtitle">{{ t('pages.character.subtitle') }}</div>

    <!-- Validation errors banner -->
    <q-banner
      v-if="validationErrors.length > 0"
      inline-actions
      class="validation-banner q-mb-md"
      data-testid="validation-errors"
    >
      <template #avatar>
        <q-icon name="error" color="negative" />
      </template>
      <div>
        <div v-for="error in validationErrors" :key="error.code" class="error-item">
          {{ t(`pages.character.errors.${error.code}`) }}
          <span v-if="error.skillId"> (ID: {{ error.skillId }})</span>
        </div>
      </div>
    </q-banner>

    <main class="q-gutter-lg">
      <!-- Dados Básicos -->
      <q-card class="erebus-card">
        <q-card-section class="card-header">
          {{ t('pages.character.sections.basicData') }}
        </q-card-section>
        <q-card-section class="card-body">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="name"
                :label="t('pages.character.fields.name')"
                :placeholder="t('pages.character.fields.namePlaceholder')"
                dense
                outlined
                data-testid="input-name"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model.number="age"
                :label="t('pages.character.fields.age')"
                type="number"
                :min="6"
                :max="90"
                dense
                outlined
                data-testid="input-age"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model.number="level"
                :label="t('pages.character.fields.level')"
                type="number"
                :min="1"
                :max="15"
                dense
                outlined
                data-testid="input-level"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Atributos -->
      <q-card class="erebus-card">
        <q-card-section class="card-header">
          <div class="row items-center justify-between">
            <span>{{ t('pages.character.sections.attributes') }}</span>
            <div class="budget-info">
              <span class="budget-label">{{ t('pages.character.budget.balance') }}:</span>
              <q-badge
                :color="attributeBalance === 0 ? 'positive' : attributeBalance > 0 ? 'warning' : 'negative'"
                :label="attributeBalance"
                data-testid="attribute-balance"
              />
              <span class="budget-label q-ml-sm">{{ t('pages.character.budget.used') }}: {{ attributeBudgetUsed }}/{{ attributeBudget }}</span>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="card-body">
          <div class="attributes-grid">
            <attribute-input
              v-for="attr in attributeKeys"
              :key="attr"
              v-model="attributes[attr]"
              :label="attr"
              :tooltip="`${attr}: 5–20`"
              :data-testid="`attr-${attr}`"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Computed Values -->
      <q-card class="erebus-card">
        <q-card-section class="card-header">{{ t('pages.character.sections.computed') }}</q-card-section>
        <q-card-section class="card-body">
          <div class="row q-col-gutter-md">
            <div class="col-6 col-md-3">
              <div class="computed-value">
                <div class="computed-label">{{ t('pages.character.computed.pv') }}</div>
                <div class="computed-number">{{ pv }}</div>
                <div class="computed-formula">{{ t('pages.character.computed.pvFormula') }}</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="computed-value">
                <div class="computed-label">{{ t('pages.character.computed.iniciativa') }}</div>
                <div class="computed-number">{{ iniciativa }}</div>
                <div class="computed-formula">{{ t('pages.character.computed.iniciativaFormula') }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Aprimoramentos -->
      <q-card class="erebus-card">
        <q-card-section class="card-header">
          <div class="row items-center justify-between">
            <span>{{ t('pages.character.sections.enhancements') }}</span>
            <div class="budget-info">
              <span class="budget-label">{{ t('pages.character.budget.balance') }}:</span>
              <q-badge
                :color="enhancementBalance === 0 ? 'positive' : enhancementBalance > 0 ? 'warning' : 'negative'"
                :label="enhancementBalance"
                data-testid="enhancement-balance"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section class="card-body">
          <div v-if="enhancements.length === 0" class="empty-list">
            {{ t('pages.character.sections.enhancements') }} — nenhum adicionado.
          </div>
          <q-list v-else dense>
            <q-item v-for="(enh, idx) in enhancements" :key="enh.id" class="enhancement-item">
              <q-item-section>
                <q-item-label>{{ enh.nome }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span :class="enh.custo >= 0 ? 'text-positive' : 'text-negative'">
                  {{ enh.custo > 0 ? '+' : '' }}{{ enh.custo }} PA
                </span>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="delete" size="sm" @click="removeEnhancement(idx)" />
              </q-item-section>
            </q-item>
          </q-list>

          <div class="q-mt-md">
            <q-btn
              outline
              :label="t('pages.character.actions.addEnhancement')"
              icon="add"
              @click="showEnhancementDialog = true"
              class="btn-outline"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Perícias -->
      <q-card class="erebus-card">
        <q-card-section class="card-header">
          <div class="row items-center justify-between">
            <span>{{ t('pages.character.sections.skills') }}</span>
            <div class="budget-info">
              <span class="budget-label">{{ t('pages.character.budget.balance') }}:</span>
              <q-badge
                :color="skillBalance >= 0 ? (skillBalance > 0 ? 'warning' : 'positive') : 'negative'"
                :label="skillBalance"
                data-testid="skill-balance"
              />
              <span class="budget-label q-ml-sm">{{ skillBudgetUsed }}/{{ skillBudget }}</span>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="card-body">
          <div v-if="skills.length === 0" class="empty-list">
            Nenhuma perícia adicionada.
          </div>
          <q-list v-else dense>
            <q-item
              v-for="(skill, idx) in skills"
              :key="skill.id"
              :class="['skill-item', { 'skill-error': isSkillError(skill.id) }]"
            >
              <q-item-section>
                <q-item-label>{{ skill.nome }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span>{{ skill.pontos }} PP</span>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="delete" size="sm" @click="removeSkill(idx)" />
              </q-item-section>
            </q-item>
          </q-list>

          <div class="q-mt-md">
            <q-btn
              outline
              :label="t('pages.character.actions.addSkill')"
              icon="add"
              @click="showSkillDialog = true"
              class="btn-outline"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Ações -->
      <div class="actions-row row q-gutter-sm justify-end">
        <q-btn
          outline
          :label="t('pages.character.actions.reset')"
          icon="refresh"
          @click="handleReset"
          class="btn-ghost"
        />

        <q-btn
          :label="t('pages.character.actions.save')"
          icon="save"
          :disable="!canSave || loading"
          :loading="loading"
          @click="handleSubmit"
          class="btn-primary"
          data-testid="btn-save"
        >
          <q-tooltip v-if="!canSave">
            {{ t('pages.character.actions.saveTooltip') }}
          </q-tooltip>
        </q-btn>
      </div>
    </main>

    <!-- Dialogs -->
    <add-skill-dialog
      v-model="showSkillDialog"
      :skill-options="availableSkillOptions"
      @add="addSkill"
    />

    <add-enhancement-dialog
      v-model="showEnhancementDialog"
      :enhancement-options="availableEnhancementOptions"
      @add="addEnhancement"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useCharacterBuilder } from 'src/composables/character.composable';
import type { CharacterEnhancement, CharacterSkill, CharacterValidationError } from 'src/model/types/character.type';
import AttributeInput from 'src/components/character/AttributeInput.vue';
import AddSkillDialog from 'src/components/character/AddSkillDialog.vue';
import AddEnhancementDialog from 'src/components/character/AddEnhancementDialog.vue';

const { t } = useI18n();
const $q = useQuasar();

const {
  name,
  age,
  level,
  attributes,
  enhancements,
  skills,
  pv,
  iniciativa,
  attributeBudget,
  attributeBudgetUsed,
  attributeBalance,
  enhancementBalance,
  skillBudget,
  skillBudgetUsed,
  skillBalance,
  canSave,
  submit,
  reset,
} = useCharacterBuilder();

const attributeKeys = ['FR', 'DEX', 'AGI', 'CON', 'INT', 'WILL', 'CAR', 'PER'] as const;

const loading = ref(false);
const showSkillDialog = ref(false);
const showEnhancementDialog = ref(false);
const validationErrors = ref<CharacterValidationError[]>([]);

// Placeholder options — in a real app these come from the API
const availableSkillOptions = computed(() => [
  { id: 1, nome: 'Espada' },
  { id: 2, nome: 'Corrida' },
  { id: 3, nome: 'Magia' },
  { id: 4, nome: 'Furtividade' },
  { id: 5, nome: 'Natação' },
]);

const availableEnhancementOptions = computed(() => [
  { id: 1, nome: 'Ambidestria', custo: 3 },
  { id: 2, nome: 'Reflexos Aguçados', custo: 2 },
  { id: 3, nome: 'Corajoso', custo: 1 },
  { id: 4, nome: 'Instinto Ruim', custo: -1 },
  { id: 5, nome: 'Covarde', custo: -2 },
]);

const errorSkillIds = computed(() =>
  new Set(
    validationErrors.value
      .filter((e) => e.skillId !== undefined)
      .map((e) => e.skillId as number),
  ),
);

function isSkillError(skillId: number): boolean {
  return errorSkillIds.value.has(skillId);
}

function addSkill(skill: CharacterSkill): void {
  skills.value = [...skills.value, skill];
}

function removeSkill(idx: number): void {
  skills.value = skills.value.filter((_, i) => i !== idx);
}

function addEnhancement(enhancement: CharacterEnhancement): void {
  enhancements.value = [...enhancements.value, enhancement];
}

function removeEnhancement(idx: number): void {
  enhancements.value = enhancements.value.filter((_, i) => i !== idx);
}

async function handleSubmit(): Promise<void> {
  loading.value = true;
  validationErrors.value = [];

  try {
    const success = await submit();

    if (success) {
      $q.notify({
        type: 'positive',
        message: t('pages.character.validation.success'),
        position: 'top',
      });
    } else {
      $q.notify({
        type: 'negative',
        message: t('pages.character.validation.failed'),
        position: 'top',
      });
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.character.validation.networkError'),
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

function handleReset(): void {
  reset();
  validationErrors.value = [];
}
</script>

<style scoped lang="scss">
.attributes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-4);
  justify-content: flex-start;
}

.computed-value {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: var(--sp-4);
  text-align: center;

  .computed-label {
    font-family: var(--font-heading);
    font-size: 0.625rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--bone-700);
    margin-bottom: var(--sp-1);
  }

  .computed-number {
    font-family: var(--font-heading);
    font-size: 2rem;
    color: var(--ember-400);
    line-height: 1;
  }

  .computed-formula {
    font-size: 0.625rem;
    color: var(--bone-600);
    margin-top: var(--sp-1);
  }
}

.budget-info {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.75rem;
  color: var(--bone-700);

  .budget-label {
    font-family: var(--font-heading);
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
}

.enhancement-item,
.skill-item {
  border-bottom: 1px solid rgba(232, 93, 26, 0.08);
}

.skill-error {
  background: rgba(200, 0, 0, 0.1);
  border-left: 3px solid var(--q-negative);
}

.actions-row {
  padding-bottom: var(--sp-6);
}

.validation-banner {
  background: rgba(200, 0, 0, 0.15);
  border: 1px solid rgba(200, 0, 0, 0.3);
  border-radius: 6px;

  .error-item {
    font-size: 0.875rem;
    color: var(--bone-200);
    padding: var(--sp-1) 0;
  }
}

.empty-list {
  color: var(--bone-600);
  font-style: italic;
  font-size: 0.875rem;
  padding: var(--sp-2) 0;
}
</style>
