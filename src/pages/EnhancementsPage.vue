<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md row q-gutter-md items-end">
      <q-input
        v-model="search"
        dense
        debounce="300"
        placeholder="Buscar por nome..."
        clearable
        class="col-12 col-sm-4"
        data-testid="search-input"
        @update:model-value="onSearchChange"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        v-model="tipoFilter"
        :options="tipoOptions"
        dense
        label="Tipo"
        emit-value
        map-options
        class="col-12 col-sm-3"
        data-testid="select-tipo"
        @update:model-value="onFilterChange"
      />
    </div>

    <q-table
      :rows="enhancements"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :rows-per-page-options="[]"
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

      <template #bottom>
        <div class="row full-width items-center justify-between q-pa-sm">
          <span class="text-caption text-grey">Total: {{ total }}</span>
          <q-pagination
            v-model="page"
            :max="totalPages"
            :max-pages="6"
            boundary-numbers
            @update:model-value="fetchEnhancements"
          />
          <q-select
            v-model="limit"
            :options="[10, 20, 50]"
            dense
            label="Por página"
            class="limit-select"
            @update:model-value="onLimitChange"
          />
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import { useEnhancements } from 'src/composables/enhancements.composable';

const $q = useQuasar();

const {
  loading,
  enhancements,
  total,
  page,
  limit,
  tipoFilter,
  search,
  fetchEnhancements,
} = useEnhancements();

const expanded = reactive(new Set<number>());

const tipoOptions = [
  { label: 'Todos', value: '' },
  { label: 'Positivo', value: 'positivo' },
  { label: 'Negativo', value: 'negativo' },
];

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));

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

function onFilterChange() {
  page.value = 1;
  void fetchEnhancements();
}

function onSearchChange() {
  page.value = 1;
  void fetchEnhancements();
}

function onLimitChange() {
  page.value = 1;
  void fetchEnhancements();
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
