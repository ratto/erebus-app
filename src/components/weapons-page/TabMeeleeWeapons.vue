<template>
  <div class="component-tab-meelee">
    <div class="q-mb-md row q-col-gutter-md items-end">
      <div class="col-12 col-md-4">
        <erebus-input
          v-model="searchMeelee"
          placeholder="Buscar por nome..."
          data-testid="input-search-meelee"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </erebus-input>
      </div>
    </div>

    <erebus-table
      :rows="filteredMeelee"
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
import ErebusInput from 'src/components/common/ErebusInput.vue';
import ErebusTable from 'src/components/common/ErebusTable.vue';

const { weapons, loading, getAllWeapons } = useWeapons();

const searchMeelee = ref<string>('');

const filteredMeelee = computed(() => {
  return weapons.value.filter(
    (w) => !searchMeelee.value || w.nome.toLowerCase().includes(searchMeelee.value.toLowerCase()),
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
    name: 'tipoDano',
    label: 'Tipo de Dano',
    field: 'tipoDano',
    sortable: true,
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
  await getAllWeapons('branca');
});
</script>
