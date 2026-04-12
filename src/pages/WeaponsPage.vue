<template>
  <q-page class="q-pa-md">
    <q-tabs v-model="activeTab" dense align="left" class="weapons-tabs q-mb-md">
      <q-tab name="meelee" label="Brancas" />
      <q-tab name="ranged" label="À Distância" />
      <q-tab name="firearm" label="Fogo" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated keep-alive>
      <q-tab-panel name="meelee" class="q-pa-none">
        <tab-meelee-weapons />
        <!-- <div class="q-mb-md">
          <q-input
            v-model="searchBranca"
            dense
            debounce="300"
            placeholder="Buscar por nome..."
            clearable
            class="col-12 col-sm-4"
            data-testid="search-meelee"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <q-table
          :rows="filteredBranca"
          :columns="columnsBranca"
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
        </q-table> -->
      </q-tab-panel>

      <q-tab-panel name="ranged" class="q-pa-none">
        <!-- <div class="q-mb-md">
          <q-input
            v-model="searchDistancia"
            dense
            debounce="300"
            placeholder="Buscar por nome..."
            clearable
            class="col-12 col-sm-4"
            data-testid="search-distancia"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <q-table
          :rows="filteredDistancia"
          :columns="columnsDistancia"
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
        </q-table> -->
      </q-tab-panel>

      <q-tab-panel name="firearm" class="q-pa-none">
        <div class="q-mb-md">
          <q-input
            v-model="searchFogo"
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
          :rows="filteredFogo"
          :columns="columnsFogo"
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
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { QTableColumn } from 'quasar';
import type { Weapon } from 'src/model/types/weapon.type';
import { useWeapons } from 'src/composables/weapons.composable';
import TabMeeleeWeapons from 'src/components/weapons-page/TabMeeleeWeapons.vue';

const { loading, weapons, getAllWeapons } = useWeapons();

const activeTab = ref<'meelee' | 'ranged' | 'firearm'>('meelee');
// const searchBranca = ref('');
// const searchDistancia = ref('');
const searchFogo = ref('');

/* const filteredBranca = computed(() =>
  weapons.value
    .filter((w) => w.tipo === 'branca')
    .filter((w) => !searchBranca.value || w.nome.toLowerCase().includes(searchBranca.value.toLowerCase())),
); */

/* const filteredDistancia = computed(() =>
  weapons.value
    .filter((w) => w.tipo === 'branca_distancia')
    .filter(
      (w) =>
        !searchDistancia.value ||
        w.nome.toLowerCase().includes(searchDistancia.value.toLowerCase()),
    ),
); */

const filteredFogo = computed(() =>
  weapons.value
    .filter((w) => w.tipo === 'fogo')
    .filter(
      (w) => !searchFogo.value || w.nome.toLowerCase().includes(searchFogo.value.toLowerCase()),
    ),
);

/* const columnsBranca: QTableColumn<Weapon>[] = [
  { name: 'nome', label: 'Nome', field: 'nome', sortable: true, align: 'left' },
  { name: 'categoria', label: 'Categoria', field: 'categoria', sortable: true, align: 'left' },
  { name: 'dano', label: 'Dano', field: 'dano', sortable: false, align: 'left' },
  { name: 'iniciativa', label: 'Iniciativa', field: 'iniciativa', sortable: true, align: 'left' },
  { name: 'tipoDano', label: 'Tipo de Dano', field: 'tipoDano', sortable: true, align: 'left' },
  { name: 'ocultabilidade', label: 'Ocultabilidade', field: 'ocultabilidade', sortable: true, align: 'left' },
]; */

/* const columnsDistancia: QTableColumn<Weapon>[] = [
  { name: 'nome', label: 'Nome', field: 'nome', sortable: true, align: 'left' },
  { name: 'categoria', label: 'Categoria', field: 'categoria', sortable: true, align: 'left' },
  { name: 'dano', label: 'Dano', field: 'dano', sortable: false, align: 'left' },
  { name: 'iniciativa', label: 'Iniciativa', field: 'iniciativa', sortable: true, align: 'left' },
  {
    name: 'alcanceMedio',
    label: 'Alcance Médio',
    field: 'alcanceMedio',
    sortable: false,
    align: 'left',
  },
  { name: 'alcanceMax', label: 'Alcance Máx', field: 'alcanceMax', sortable: false, align: 'left' },
]; */

const columnsFogo: QTableColumn<Weapon>[] = [
  { name: 'nome', label: 'Nome', field: 'nome', sortable: true, align: 'left' },
  { name: 'categoria', label: 'Categoria', field: 'categoria', sortable: true, align: 'left' },
  { name: 'calibre', label: 'Calibre', field: 'calibre', sortable: true, align: 'left' },
  { name: 'dano', label: 'Dano', field: 'dano', sortable: false, align: 'left' },
  {
    name: 'alcanceEfetivo',
    label: 'Alcance Efetivo',
    field: 'alcanceEfetivo',
    sortable: false,
    align: 'left',
  },
  { name: 'rof', label: 'ROF', field: 'rof', sortable: false, align: 'left' },
  { name: 'pente', label: 'Pente', field: 'pente', sortable: false, align: 'left' },
  {
    name: 'ocultabilidade',
    label: 'Ocultabilidade',
    field: 'ocultabilidade',
    sortable: true,
    align: 'left',
  },
];

onMounted(async () => {
  await getAllWeapons();
});
</script>

<style scoped lang="scss">
.weapons-tabs {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
