<template>
  <q-page id="capacity-page" class="erebus-page q-pa-md">
    <h1>Capacidade Física</h1>
    <div class="subtitle">
      Calcule a capacidade física (Y), a constante K e o bônus de dano do Sistema Daemon.
    </div>

    <main class="q-gutter-lg">
      <q-card class="erebus-card">
        <q-card-section>
          <q-tabs
            v-model="activeTab"
            dense
            align="left"
          >
            <q-tab name="calculateY" label="Calcular Y" data-testid="tab-calculate-y" />
            <q-tab name="calculateK" label="Calcular K" data-testid="tab-calculate-k" />
            <q-tab name="damageBonus" label="Bônus de Dano" data-testid="tab-damage-bonus" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- Tab: Calcular Y -->
            <q-tab-panel name="calculateY">
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="yAttribute"
                    type="number"
                    label="Atributo"
                    dense
                    outlined
                    data-testid="input-y-attribute"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="yK"
                    type="number"
                    label="K"
                    dense
                    outlined
                    data-testid="input-y-k"
                  />
                </div>
              </div>
              <q-btn
                label="Calcular Y"
                :loading="loading"
                @click="handleCalculateY"
                data-testid="btn-calculate-y"
              />
            </q-tab-panel>

            <!-- Tab: Calcular K -->
            <q-tab-panel name="calculateK">
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="kAttribute"
                    type="number"
                    label="Atributo"
                    dense
                    outlined
                    data-testid="input-k-attribute"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="kY"
                    type="number"
                    label="Y"
                    dense
                    outlined
                    data-testid="input-k-y"
                  />
                </div>
              </div>
              <q-btn
                label="Calcular K"
                :loading="loading"
                @click="handleCalculateK"
                data-testid="btn-calculate-k"
              />
            </q-tab-panel>

            <!-- Tab: Bônus de Dano -->
            <q-tab-panel name="damageBonus">
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="fr"
                    type="number"
                    label="FR (Força)"
                    dense
                    outlined
                    data-testid="input-fr"
                  />
                </div>
              </div>
              <q-btn
                label="Calcular Bônus de Dano"
                :loading="loading"
                @click="handleCalculateDamageBonus"
                data-testid="btn-calculate-damage-bonus"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>

      <!-- Resultado -->
      <q-card v-if="result !== null" class="erebus-card" data-testid="capacity-result">
        <q-card-section>
          <div class="result-label">Resultado</div>
          <div class="result-value" data-testid="result-value">{{ result }}</div>
        </q-card-section>
      </q-card>

      <!-- Erro -->
      <q-banner v-if="error !== null" class="bg-negative text-white" data-testid="capacity-error">
        {{ error }}
      </q-banner>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCapacity } from 'src/composables/capacity.composable';

const { loading, result, error, calculateY, calculateK, calculateDamageBonus } = useCapacity();

const activeTab = ref<string>('calculateY');

const yAttribute = ref<number | null>(null);
const yK = ref<number | null>(null);

const kAttribute = ref<number | null>(null);
const kY = ref<number | null>(null);

const fr = ref<number | null>(null);

function handleCalculateY(): void {
  if (yAttribute.value === null || yK.value === null) return;
  void calculateY(yAttribute.value, yK.value);
}

function handleCalculateK(): void {
  if (kAttribute.value === null || kY.value === null) return;
  void calculateK(kAttribute.value, kY.value);
}

function handleCalculateDamageBonus(): void {
  if (fr.value === null) return;
  void calculateDamageBonus(fr.value);
}
</script>

<style scoped lang="scss">
.result-label {
  font-family: var(--font-heading);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--bone-700);
  margin-bottom: var(--sp-2);
}

.result-value {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  color: var(--ember-400);
}
</style>
