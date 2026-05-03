<template>
  <q-page id="combat-skills-page" class="erebus-page q-pa-md">
    <h1>{{ t('pages.combatSkills.title') }}</h1>
    <div class="subtitle">
      {{ t('pages.combatSkills.subtitle') }}
    </div>

    <main class="q-gutter-lg">
      <q-card class="erebus-card filtros-card">
        <q-card-section class="card-header">{{ t('common.filters') }}</q-card-section>
        <q-card-section class="card-body">
          <div class="q-mb-md row q-col-gutter-md items-end">
            <div class="col-12 col-md-4">
              <erebus-input
                v-model="searchText"
                :label="t('pages.combatSkills.filters.search.label')"
                :placeholder="t('pages.combatSkills.filters.search.placeholder')"
                inner-class="input-search"
                data-testid="search-input"
              >
                <template #append>
                  <q-icon name="search" />
                </template>
              </erebus-input>
            </div>

            <div class="col-12 col-md-4 col-lg-2">
              <erebus-select
                v-model="selectedTipo"
                :options="tipoOptions"
                :label="t('pages.combatSkills.filters.selectType.label')"
                data-testid="select-tipo"
              />
            </div>

            <div class="col-12 col-md-4 col-lg-2">
              <erebus-select
                v-model="selectedAtributo"
                :options="atributoOptions"
                :label="t('pages.combatSkills.filters.selectAttribute.label')"
                data-testid="select-atributo"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-table
        :rows="combatSkills"
        :columns="visibleColumnsConfig"
        row-key="id"
        v-model:pagination="pagination"
        :filter="filterComputed"
        :filter-method="filterMethod"
        :loading="loading"
        :rows-per-page-options="[10, 15, 25, 50, 0]"
        :no-data-label="t('pages.combatSkills.noData')"
      >
        <template #no-data="{ message }">
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon name="search_off" size="2em" />
            <span>{{ message }}</span>
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
            <q-td key="nome" :props="props">{{ props.row.nome }}</q-td>
            <q-td key="tipo" :props="props">
              <q-badge
                :color="tipoBadgeColor(props.row.tipo)"
                :label="tipoBadgeLabel(props.row.tipo)"
              />
            </q-td>
            <q-td v-if="!$q.screen.lt.md" key="atributoAtaque" :props="props">
              {{ props.row.atributoAtaque ?? '—' }}
            </q-td>
            <q-td v-if="!$q.screen.lt.md" key="atributoDefesa" :props="props">
              {{ props.row.atributoDefesa ?? '—' }}
            </q-td>
            <q-td v-if="!$q.screen.lt.md" key="aprimoramentoRequerido" :props="props">
              {{ props.row.aprimoramentoRequerido ?? '—' }}
            </q-td>
          </q-tr>
          <q-tr v-if="expanded.has(props.row.id)" :props="props">
            <q-td colspan="100%" class="combat-skill-description">
              {{ props.row.descricao }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { type QTableColumn, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { CombatSkill } from 'src/model/types/combat-skill.type';
import { useCombatSkills } from 'src/composables/combat-skills.composable';
import { attributeOptions } from 'src/utils/options';
import ErebusInput from 'src/components/common/ErebusInput.vue';
import ErebusSelect from 'src/components/common/ErebusSelect.vue';

const $q = useQuasar();
const { t } = useI18n();
const { loading, combatSkills, getAllCombatSkills } = useCombatSkills();

const expanded = reactive(new Set<number>());

const searchText = ref('');
const selectedTipo = ref<string | null>(null);
const selectedAtributo = ref<string | null>(null);

const pagination = ref({
  page: 1,
  rowsPerPage: 15,
});

const tipoOptions = computed(() => [
  { label: '', value: null },
  { label: t('pages.combatSkills.types.melee'), value: 'melee' },
  { label: t('pages.combatSkills.types.ranged'), value: 'ranged' },
  { label: t('pages.combatSkills.types.shield'), value: 'shield' },
]);

const atributoOptions = [
  { label: '', value: null },
  ...attributeOptions,
];

const filterComputed = computed(() => ({
  nome: searchText.value,
  tipo: selectedTipo.value,
  atributo: selectedAtributo.value,
}));

const allColumns = computed<QTableColumn[]>(() => [
  { name: 'expand', label: '', field: 'id', align: 'left' },
  {
    name: 'nome',
    label: t('pages.combatSkills.columns.name'),
    field: 'nome',
    sortable: true,
    align: 'left',
  },
  {
    name: 'tipo',
    label: t('pages.combatSkills.columns.type'),
    field: 'tipo',
    sortable: true,
    align: 'left',
  },
  {
    name: 'atributoAtaque',
    label: t('pages.combatSkills.columns.attackAttribute'),
    field: 'atributoAtaque',
    sortable: true,
    align: 'left',
  },
  {
    name: 'atributoDefesa',
    label: t('pages.combatSkills.columns.defenseAttribute'),
    field: 'atributoDefesa',
    sortable: true,
    align: 'left',
  },
  {
    name: 'aprimoramentoRequerido',
    label: t('pages.combatSkills.columns.requirement'),
    field: 'aprimoramentoRequerido',
    sortable: true,
    align: 'left',
  },
]);

const visibleColumnsConfig = computed<QTableColumn[]>(() => {
  if ($q.screen.lt.md) {
    return allColumns.value.filter(
      (c) => !['atributoAtaque', 'atributoDefesa', 'aprimoramentoRequerido'].includes(c.name),
    );
  }
  return allColumns.value;
});

function tipoBadgeColor(tipo: string): string {
  if (tipo === 'melee') return 'warning';
  if (tipo === 'ranged') return 'info';
  return 'secondary';
}

function tipoBadgeLabel(tipo: string): string {
  return t(`pages.combatSkills.types.${tipo}`);
}

function filterMethod(
  rows: readonly CombatSkill[],
  terms: { nome: string; tipo: string | null; atributo: string | null },
): CombatSkill[] {
  return (rows as CombatSkill[]).filter((row) => {
    const matchNome = !terms.nome || row.nome.toLowerCase().includes(terms.nome.toLowerCase());
    const matchTipo = !terms.tipo || row.tipo === terms.tipo;
    const matchAtributo =
      !terms.atributo ||
      row.atributoAtaque === terms.atributo ||
      row.atributoDefesa === terms.atributo;
    return matchNome && matchTipo && matchAtributo;
  });
}

function toggleExpand(id: number): void {
  if (expanded.has(id)) {
    expanded.delete(id);
  } else {
    expanded.add(id);
  }
}

onMounted(async () => {
  await getAllCombatSkills();
});
</script>

<style scoped lang="scss">
.combat-skill-description {
  padding: 12px 16px;
  font-style: italic;
  color: var(--bone-600, #aaa);
  background: rgba(0, 0, 0, 0.15);
}
</style>
