<template>
  <div class="component-firearm-weapons">
    <div class="q-mb-md">
      <q-input
        v-model="searchFirearm"
        dense
        debounce="300"
        placeholder="Buscar por nome..."
        clearable
        class="col-12 col-sm-4"
        data-testid="search-firearm"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
    <q-table
      :rows="filteredFirearm"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :rows-per-page-options="[15, 25, 50]"
      class="weapons-table"
    >
      <template #no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-md">
          <q-icon size="2em" name="search_off" />
          <span>Nenhuma arma encontrada.</span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { type QTableColumn } from 'quasar';
import { useWeapons } from 'src/composables/weapons.composable';
import type { Weapon } from 'src/model/types/weapon.type';

const { weapons, loading, getAllWeapons } = useWeapons();

const searchFirearm = ref<string>('');

const filteredFirearm = computed(() => {
  return weapons.value.filter(
    (w) => !searchFirearm.value || w.nome.toLowerCase().includes(searchFirearm.value.toLowerCase()),
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
    name: 'calibre',
    label: 'Calibre',
    field: 'calibre',
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
    name: 'alcanceEfetivo',
    label: 'Alcance Efetivo',
    field: 'alcanceEfetivo',
    sortable: false,
    align: 'left',
  },
  {
    name: 'rof',
    label: 'ROF',
    field: 'rof',
    sortable: false,
    align: 'left',
  },
  {
    name: 'pente',
    label: 'Pente',
    field: 'pente',
    sortable: false,
    align: 'left',
  },
  {
    name: 'ocultabilidade',
    label: 'Ocultabilidade',
    field: 'ocultabilidade',
    sortable: true,
    align: 'left',
  },
];

onBeforeMount(async () => {
  await getAllWeapons('fogo');
});
</script>
