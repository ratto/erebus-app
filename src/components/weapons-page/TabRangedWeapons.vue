<template>
  <div class="component-tab-ranged">
    <div class="q-mb-md row q-col-gutter-md items-end">
      <div class="col-12 col-md-4">
        <erebus-input
          v-model="searchRanged"
          placeholder="Buscar por nome..."
          data-testid="input-search-ranged"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </erebus-input>
      </div>
    </div>

    <erebus-table
      :rows="filteredRanged"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :rows-per-page-options="[15, 25, 50]"
      no-data-label="Nenhuma arma encontrada."
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { type QTableColumn } from 'quasar';
import { useWeapons } from 'src/composables/weapons.composable';
import type { Weapon } from 'src/model/types/weapon.type';
import ErebusTable from 'src/components/common/ErebusTable.vue';

const { weapons, loading, getAllWeapons } = useWeapons();

const searchRanged = ref<string>('');

const filteredRanged = computed(() => {
  return weapons.value.filter(
    (w) => !searchRanged.value || w.nome.toLowerCase().includes(searchRanged.value.toLowerCase()),
  );
});

const columns: QTableColumn<Weapon>[] = [
  {
    name: 'nome',
    label: 'Nome',
    field: 'nome',
    sortable: true,
    align: 'left',
  },
  {
    name: 'categoria',
    label: 'Categoria',
    field: 'categoria',
    sortable: true,
    align: 'left',
  },
  {
    name: 'dano',
    label: 'Dano',
    field: 'dano',
    sortable: false,
    align: 'left',
  },
  {
    name: 'iniciativa',
    label: 'Iniciativa',
    field: 'iniciativa',
    sortable: true,
    align: 'left',
  },
  {
    name: 'alcanceMedio',
    label: 'Alcance Médio',
    field: 'alcanceMedio',
    sortable: false,
    align: 'left',
  },
  {
    name: 'alcanceMax',
    label: 'Alcance Máx',
    field: 'alcanceMax',
    sortable: false,
    align: 'left',
  },
];

onBeforeMount(async () => {
  await getAllWeapons('branca_distancia');
});
</script>
