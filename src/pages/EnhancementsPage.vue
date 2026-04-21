<template>
  <q-page id="enhancements-page" class="erebus-page q-pa-md">
    <h1>{{ t('pages.enhancements.title') }}</h1>
    <div class="subtitle">
      {{ t('pages.enhancements.subtitle') }}
    </div>

    <main class="q-gutter-lg">
      <q-card class="erebus-card filtros-card">
        <q-card-section class="card-header">{{ t('common.filters') }}</q-card-section>
        <q-card-section class="card-body">
          <div class="q-mb-md row q-col-gutter-md items-end">
            <div class="col-12 col-md-4">
              <erebus-input
                v-model="searchName"
                :label="t('pages.enhancements.filters.search.label')"
                :placeholder="t('pages.enhancements.filters.search.placeholder')"
                inner-class="input-search"
              />
            </div>
            <div class="col-12 col-md-4">
              <erebus-select
                v-model="typeSelected"
                :options="tipoOptions"
                :label="t('pages.enhancements.filters.selectType.label')"
                data-testid="select-type"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-table
        :rows="enhancements"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :rows-per-page-options="[10, 15, 25, 50]"
        :filter="filterComputed"
        class="enhancements-table"
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
            <q-td key="nome" :props="props">{{ props.row.nome }}</q-td>
            <q-td key="tipo" :props="props">
              <q-badge
                :color="props.row.tipo === 'positivo' ? 'positive' : 'negative'"
                :label="props.row.tipo === 'positivo' ? 'Positivo' : 'Negativo'"
              />
            </q-td>
            <q-td key="custo" :props="props">
              <span :class="props.row.custo >= 0 ? 'text-positive' : 'text-negative'">
                {{ props.row.custo > 0 ? '+' : '' }}{{ props.row.custo }}
              </span>
            </q-td>
            <q-td v-if="!$q.screen.lt.md" key="descricao" :props="props" class="descricao-preview">
              {{ props.row.descricao }}
            </q-td>
          </q-tr>
          <q-tr v-if="expanded.has(props.row.id)" :props="props">
            <q-td colspan="100%" class="enhancement-description">
              {{ props.row.descricao }}
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey q-gutter-sm q-pa-md">
            <q-icon size="2em" name="search_off" />
            <span>{{ t('pages.enhancements.noData') }}</span>
          </div>
        </template>
      </q-table>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { type QTableColumn, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useEnhancements } from 'src/composables/enhancements.composable';
import ErebusInput from 'src/components/common/ErebusInput.vue';
import ErebusSelect from 'src/components/common/ErebusSelect.vue';

const $q = useQuasar();
const { t } = useI18n();

const { loading, enhancements, fetchEnhancements } = useEnhancements();

const expanded = reactive(new Set<number>());

const searchName = ref<string>('');
const typeSelected = ref<string | null>('');
const pagination = ref({
  page: 1,
  rowsPerPage: 100,
});

const tipoOptions = [
  { label: t('pages.enhancements.options.all'), value: '' },
  { label: t('pages.enhancements.options.positive'), value: 'positivo' },
  { label: t('pages.enhancements.options.negative'), value: 'negativo' },
];

const filterComputed = computed(() => ({
  nome: searchName.value,
  tipo: typeSelected.value,
}));

const columns = computed<QTableColumn[]>(() => {
  const base: QTableColumn[] = [
    { name: 'expand', label: '', field: 'id', align: 'left' },
    {
      name: 'nome',
      label: t('pages.enhancements.columns.name'),
      field: 'nome',
      sortable: true,
      align: 'left',
    },
    {
      name: 'tipo',
      label: t('pages.enhancements.columns.type'),
      field: 'tipo',
      sortable: true,
      align: 'center',
    },
    {
      name: 'custo',
      label: t('pages.enhancements.columns.cost'),
      field: 'custo',
      sortable: true,
      align: 'center',
    },
  ];
  if (!$q.screen.lt.md) {
    base.push({
      name: 'descricao',
      label: t('pages.enhancements.columns.description'),
      field: 'descricao',
      align: 'left',
    });
  }
  return base;
});

function toggleExpand(id: number): void {
  if (expanded.has(id)) {
    expanded.delete(id);
  } else {
    expanded.add(id);
  }
}

onMounted(async () => {
  await fetchEnhancements();
});
</script>

<style scoped lang="scss">
.enhancement-description {
  padding: 12px 16px;
  font-style: italic;
  color: var(--bone-600, #aaa);
  background: rgba(0, 0, 0, 0.15);
}

.descricao-preview {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.limit-select {
  width: 100px;
}
</style>
