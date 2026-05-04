<template>
  <q-page id="protective-equipment-page" class="erebus-page q-pa-md">
    <h1>{{ t('pages.protectiveEquipment.title') }}</h1>
    <div class="subtitle">
      {{ t('pages.protectiveEquipment.subtitle') }}
    </div>

    <main class="q-gutter-lg">
      <q-card class="erebus-card filtros-card">
        <q-card-section class="card-header">{{ t('common.filters') }}</q-card-section>
        <q-card-section class="card-body">
          <div class="q-mb-md row q-col-gutter-md items-end">
            <div class="col-12 col-md-4">
              <erebus-input
                v-model="equipmentSearch"
                :label="t('pages.protectiveEquipment.filters.equipment')"
                :placeholder="t('pages.protectiveEquipment.filters.equipment')"
                inner-class="input-search"
                data-testid="search-input"
              >
                <template #append>
                  <q-icon name="search" />
                </template>
              </erebus-input>
            </div>

            <div class="col-12 col-md-4 col-lg-3">
              <erebus-select
                v-model="selectedDamageType"
                :options="damageTypeOptions"
                :label="t('pages.protectiveEquipment.filters.damageType')"
                data-testid="select-damage-type"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md items-end q-mb-md">
            <div class="col-6 col-md-3 col-lg-2">
              <q-input
                v-model.number="minDexPenalty"
                type="number"
                :label="t('pages.protectiveEquipment.filters.minDexPenalty')"
                :min="0"
                dense
                outlined
                class="erebus-input"
                data-testid="input-min-dex-penalty"
                @update:model-value="onNumericFilterChange"
              />
            </div>

            <div class="col-6 col-md-3 col-lg-2">
              <q-input
                v-model.number="maxDexPenalty"
                type="number"
                :label="t('pages.protectiveEquipment.filters.maxDexPenalty')"
                :min="0"
                dense
                outlined
                class="erebus-input"
                data-testid="input-max-dex-penalty"
                @update:model-value="onNumericFilterChange"
              />
            </div>

            <div class="col-6 col-md-3 col-lg-2">
              <q-input
                v-model.number="minAgiPenalty"
                type="number"
                :label="t('pages.protectiveEquipment.filters.minAgiPenalty')"
                :min="0"
                dense
                outlined
                class="erebus-input"
                data-testid="input-min-agi-penalty"
                @update:model-value="onNumericFilterChange"
              />
            </div>

            <div class="col-6 col-md-3 col-lg-2">
              <q-input
                v-model.number="maxAgiPenalty"
                type="number"
                :label="t('pages.protectiveEquipment.filters.maxAgiPenalty')"
                :min="0"
                dense
                outlined
                class="erebus-input"
                data-testid="input-max-agi-penalty"
                @update:model-value="onNumericFilterChange"
              />
            </div>

            <div class="col-12 col-md-auto">
              <q-btn
                flat
                :label="t('pages.protectiveEquipment.filters.clearFilters')"
                icon="clear"
                class="erebus-btn-secondary"
                data-testid="clear-filters"
                @click="clearFilters"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <erebus-table
        :rows="protectiveEquipments"
        :columns="visibleColumns"
        row-key="id"
        :loading="loading"
        :rows-per-page-options="[10, 15, 25, 50, 0]"
        :no-data-label="t('pages.protectiveEquipment.noData')"
      >
        <template #no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-md">
            <q-icon name="shield" size="2em" />
            <span>{{ t('pages.protectiveEquipment.noData') }}</span>
          </div>
        </template>

        <template #body="props">
          <q-tr :props="props">
            <q-td key="expand" class="q-td--expand">
              <q-btn
                flat
                round
                dense
                :icon="expanded.has(props.row.id) ? 'chevron_up' : 'chevron_down'"
                @click="toggleExpand(props.row.id)"
                data-testid="chevron-btn"
              />
            </q-td>
            <q-td key="name" :props="props">{{ props.row.name }}</q-td>
            <q-td key="dexPenalty" :props="props">{{ props.row.dexPenalty }}</q-td>
            <q-td key="agiPenalty" :props="props">{{ props.row.agiPenalty }}</q-td>
            <template v-if="!$q.screen.lt.md">
              <q-td v-for="dmgType in DAMAGE_TYPES" :key="dmgType" :props="props">
                {{ getIpValue(props.row, dmgType) }}
              </q-td>
            </template>
          </q-tr>
          <q-tr v-if="expanded.has(props.row.id)" :props="props">
            <q-td colspan="100%" class="equipment-description">
              <div><strong>{{ t('pages.protectiveEquipment.columns.description') }}:</strong> {{ props.row.description }}</div>
              <div class="q-mt-xs"><strong>{{ t('pages.protectiveEquipment.columns.source') }}:</strong> {{ props.row.source }}</div>
            </q-td>
          </q-tr>
        </template>
      </erebus-table>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { type QTableColumn, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { ProtectiveEquipment, ProtectiveEquipmentFilters } from 'src/model/types/protective-equipment.type';
import { useProtectiveEquipment } from 'src/composables/protective-equipment.composable';
import ErebusInput from 'src/components/common/ErebusInput.vue';
import ErebusSelect from 'src/components/common/ErebusSelect.vue';
import ErebusTable from 'src/components/common/ErebusTable.vue';

const $q = useQuasar();
const { t } = useI18n();
const { loading, protectiveEquipments, fetchProtectiveEquipment } = useProtectiveEquipment();

const expanded = reactive(new Set<number>());

const DAMAGE_TYPES = ['KINETIC', 'BALLISTIC', 'FIRE', 'COLD', 'GAS', 'ACID', 'VACUUM', 'ELECTRIC'] as const;

const equipmentSearch = ref('');
const selectedDamageType = ref<string | null>(null);
const minDexPenalty = ref<number | null>(null);
const maxDexPenalty = ref<number | null>(null);
const minAgiPenalty = ref<number | null>(null);
const maxAgiPenalty = ref<number | null>(null);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const damageTypeOptions = computed(() => [
  { label: '', value: null },
  ...DAMAGE_TYPES.map((dt) => ({ label: dt, value: dt })),
]);

function buildFilters(): ProtectiveEquipmentFilters {
  const filters: ProtectiveEquipmentFilters = {};
  if (equipmentSearch.value)                       filters.equipment      = equipmentSearch.value;
  if (selectedDamageType.value)                    filters.damageType     = selectedDamageType.value;
  if (minDexPenalty.value !== null)                filters.minDexPenalty  = minDexPenalty.value;
  if (maxDexPenalty.value !== null)                filters.maxDexPenalty  = maxDexPenalty.value;
  if (minAgiPenalty.value !== null)                filters.minAgiPenalty  = minAgiPenalty.value;
  if (maxAgiPenalty.value !== null)                filters.maxAgiPenalty  = maxAgiPenalty.value;
  return filters;
}

function applyFilters(): void {
  void fetchProtectiveEquipment(buildFilters());
}

// Text input with debounce
watch(equipmentSearch, () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    applyFilters();
  }, 300);
});

// Select / numeric filters without debounce
watch(selectedDamageType, () => applyFilters());

function onNumericFilterChange(): void {
  applyFilters();
}

function clearFilters(): void {
  equipmentSearch.value = '';
  selectedDamageType.value = null;
  minDexPenalty.value = null;
  maxDexPenalty.value = null;
  minAgiPenalty.value = null;
  maxAgiPenalty.value = null;
  applyFilters();
}

function getIpValue(row: ProtectiveEquipment, damageType: string): number {
  const entry = row.protectiveIndex.find((e) => e.damageType === damageType);
  return entry?.ipValue ?? 0;
}

function toggleExpand(id: number): void {
  if (expanded.has(id)) {
    expanded.delete(id);
  } else {
    expanded.add(id);
  }
}

const allColumns = computed<QTableColumn[]>(() => [
  { name: 'expand', label: '', field: 'id', align: 'left' },
  {
    name: 'name',
    label: t('pages.protectiveEquipment.columns.name'),
    field: 'name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'dexPenalty',
    label: t('pages.protectiveEquipment.columns.dexPenalty'),
    field: 'dexPenalty',
    sortable: true,
    align: 'center',
  },
  {
    name: 'agiPenalty',
    label: t('pages.protectiveEquipment.columns.agiPenalty'),
    field: 'agiPenalty',
    sortable: true,
    align: 'center',
  },
  ...DAMAGE_TYPES.map((dt) => ({
    name: dt,
    label: dt,
    field: (row: ProtectiveEquipment) => getIpValue(row, dt),
    sortable: true,
    align: 'center' as const,
  })),
]);

const visibleColumns = computed<QTableColumn[]>(() => {
  if ($q.screen.lt.md) {
    return allColumns.value.filter((c) => !DAMAGE_TYPES.includes(c.name as typeof DAMAGE_TYPES[number]));
  }
  return allColumns.value;
});

onMounted(async () => {
  await fetchProtectiveEquipment();
});
</script>

<style scoped lang="scss">
.equipment-description {
  padding: 12px 16px;
  font-style: italic;
  color: var(--bone-600, #aaa);
  background: rgba(0, 0, 0, 0.15);
}
</style>
