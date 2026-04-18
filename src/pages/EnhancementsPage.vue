<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md row q-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchName"
          dense
          debounce="300"
          placeholder="Buscar por nome..."
          clearable
          class="col-12 col-sm-4"
          data-testid="input-search-name"
        >
          <template #append>
            <q-icon name="o_search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-6">
        <q-select
          v-model="typeSelected"
          :options="tipoOptions"
          dense
          label="Tipo"
          emit-value
          map-options
          class="col-12 col-sm-3"
          data-testid="select-type"
        />
      </div>
    </div>

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
          <span>Nenhum aprimoramento encontrado para os filtros aplicados.</span>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import { useEnhancements } from 'src/composables/enhancements.composable';

const $q = useQuasar();
const { loading, enhancements, fetchEnhancements } = useEnhancements();

const expanded = reactive(new Set<number>());

const searchName = ref<string>('');
const typeSelected = ref<string | null>('');
const pagination = ref({
  page: 1,
  rowsPerPage: 100,
});

const tipoOptions = [
  { label: 'Todos', value: '' },
  { label: 'Positivo', value: 'positivo' },
  { label: 'Negativo', value: 'negativo' },
];

const filterComputed = computed(() => ({
  nome: searchName.value,
  tipo: typeSelected.value,
}));

const columns = computed<QTableColumn[]>(() => {
  const base: QTableColumn[] = [
    { name: 'expand', label: '', field: 'id', align: 'left' },
    { name: 'nome', label: 'Nome', field: 'nome', sortable: true, align: 'left' },
    { name: 'tipo', label: 'Tipo', field: 'tipo', sortable: true, align: 'center' },
    { name: 'custo', label: 'Custo', field: 'custo', sortable: true, align: 'center' },
  ];
  if (!$q.screen.lt.md) {
    base.push({ name: 'descricao', label: 'Descrição', field: 'descricao', align: 'left' });
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
