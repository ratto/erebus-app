<template>
  <q-page id="skills-page" class="erebus-page q-pa-md">
    <h1>{{ t('pages.skills.title') }}</h1>
    <div class="subtitle">
      {{ t('pages.skills.subtitle') }}
    </div>

    <main class="q-gutter-lg">
      <q-card class="erebus-card filtros-card">
        <q-card-section class="card-header">{{ t('common.filters') }}</q-card-section>
        <q-card-section class="card-body">
          <div class="q-mb-md row q-col-gutter-md items-end">
            <div class="col-12 col-md-4">
              <erebus-input
                v-model="searchText"
                :label="t('pages.skills.filters.search.label')"
                :placeholder="t('pages.skills.filters.search.placeholder')"
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
                v-model="selectedGroup"
                :options="grupoOptions"
                :label="t('pages.skills.filters.selectGroup.label')"
                data-testid="select-grupo"
              />
            </div>

            <div class="col-12 col-md-4 col-lg-2">
              <erebus-select
                v-model="selectedAtributo"
                :options="atributoOptions"
                :label="t('pages.skills.filters.selectAttribute.label')"
                data-testid="select-atributo"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <erebus-table
        :rows="skills"
        :columns="visibleColumnsConfig"
        row-key="id"
        v-model:pagination="pagination"
        :filter="filterComputed"
        :filter-method="filterMethod"
        :loading="loading"
        :no-data-label="t('pages.skills.noData')"
      >
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
            <q-td key="group" :props="props">{{ props.row.group ?? '—' }}</q-td>
            <q-td v-if="!$q.screen.lt.md" key="atributoBase" :props="props">{{
              props.row.atributoBase ?? '—'
            }}</q-td>
            <q-td key="apenasComTreinamento" :props="props">
              <q-badge v-if="!props.row.apenasComTreinamento" color="negative" label="Não" />
              <q-badge v-else color="positive" label="Sim" />
            </q-td>
            <q-td v-if="!$q.screen.lt.md" key="synergy" :props="props">{{
              props.row.synergy ?? '—'
            }}</q-td>
          </q-tr>
          <q-tr v-if="expanded.has(props.row.id)" :props="props">
            <q-td colspan="100%" class="skill-description">
              {{ props.row.description }}
            </q-td>
          </q-tr>
        </template>
      </erebus-table>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { type QTableColumn, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { Skill } from 'src/model/types/skill.type';
import { useSkills } from 'src/composables/skills.composable';
import { attributeOptions } from 'src/utils/options';
import ErebusInput from 'src/components/common/ErebusInput.vue';
import ErebusSelect from 'src/components/common/ErebusSelect.vue';
import ErebusTable from 'src/components/common/ErebusTable.vue';

const $q = useQuasar();
const { t } = useI18n();
const { loading, skills, getAllSkills } = useSkills();

const expanded = reactive(new Set<number>());

const searchText = ref('');
const selectedGroup = ref<string | null>(null);
const selectedAtributo = ref<string | null>(null);

const pagination = ref({
  page: 1,
  rowsPerPage: 15,
});

const atributoOptions = [
  { label: '', value: null },
  { label: t('pages.skills.noneOption'), value: '__none__' },
  ...attributeOptions,
];

const grupoOptions = computed(() => {
  const groups = new Set<string>();
  skills.value.forEach((s) => {
    if (s.group) groups.add(s.group);
  });
  return [{ label: '', value: null }, ...[...groups].sort().map((g) => ({ label: g, value: g }))];
});

const filterComputed = computed(() => ({
  name: searchText.value,
  group: selectedGroup.value,
  atributo: selectedAtributo.value,
}));

const allColumns = computed<QTableColumn[]>(() => [
  { name: 'expand', label: '', field: 'id', align: 'left' },
  {
    name: 'name',
    label: t('pages.skills.columns.name'),
    field: 'name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'group',
    label: t('pages.skills.columns.group'),
    field: 'group',
    sortable: true,
    align: 'left',
  },
  {
    name: 'atributoBase',
    label: t('pages.skills.columns.baseAttribute'),
    field: 'atributoBase',
    sortable: true,
    align: 'left',
  },
  {
    name: 'apenasComTreinamento',
    label: t('pages.skills.columns.trainedOnly'),
    field: 'apenasComTreinamento',
    align: 'center',
  },
  { name: 'synergy', label: t('pages.skills.columns.synergy'), field: 'synergy', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]);

const visibleColumnsConfig = computed<QTableColumn[]>(() => {
  if ($q.screen.lt.md) {
    return allColumns.value.filter((c) => !['atributoBase', 'synergy'].includes(c.name));
  }
  return allColumns.value;
});

function filterMethod(
  rows: readonly Skill[],
  terms: { name: string; group: string | null; atributo: string | null },
): Skill[] {
  return (rows as Skill[]).filter((row) => {
    const matchName = !terms.name || row.name.toLowerCase().includes(terms.name.toLowerCase());
    const matchGroup = !terms.group || row.group === terms.group;
    const matchAtributo =
      !terms.atributo ||
      (terms.atributo === '__none__'
        ? row.atributoBase === null
        : row.atributoBase === terms.atributo);
    return matchName && matchGroup && matchAtributo;
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
  await getAllSkills();
});
</script>

<style scoped lang="scss">
.skill-description {
  padding: 12px 16px;
  font-style: italic;
  color: var(--bone-600, #aaa);
  background: rgba(0, 0, 0, 0.15);
}
</style>
