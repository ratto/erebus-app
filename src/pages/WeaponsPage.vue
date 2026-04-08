<template>
  <q-page class="q-pa-md">
    <q-tabs
      v-model="activeTab"
      dense
      align="left"
      class="weapons-tabs q-mb-md"
    >
      <q-tab name="branca" :label="t('pages.weapons.tabs.melee')" />
      <q-tab name="branca_distancia" :label="t('pages.weapons.tabs.ranged')" />
      <q-tab name="fogo" :label="t('pages.weapons.tabs.firearm')" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated keep-alive>
      <q-tab-panel name="branca" class="q-pa-none">
        <div class="q-mb-md">
          <q-input
            v-model="searchBranca"
            dense
            debounce="300"
            :placeholder="t('pages.weapons.searchPlaceholder')"
            clearable
            class="col-12 col-sm-4"
            data-testid="search-branca"
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
              <span>{{ t('pages.weapons.noData') }}</span>
            </div>
          </template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel name="branca_distancia" class="q-pa-none">
        <div class="q-mb-md">
          <q-input
            v-model="searchDistancia"
            dense
            debounce="300"
            :placeholder="t('pages.weapons.searchPlaceholder')"
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
              <span>{{ t('pages.weapons.noData') }}</span>
            </div>
          </template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel name="fogo" class="q-pa-none">
        <div class="q-mb-md">
          <q-input
            v-model="searchFogo"
            dense
            debounce="300"
            :placeholder="t('pages.weapons.searchPlaceholder')"
            clearable
            class="col-12 col-sm-4"
            data-testid="search-fogo"
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
              <span>{{ t('pages.weapons.noData') }}</span>
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
import { useI18n } from 'vue-i18n';
import type { Weapon } from 'src/model/types/weapon.type';
import { useWeapons } from 'src/composables/weapons.composable';

const { t } = useI18n();
const { loading, weapons, getAllWeapons } = useWeapons();

const activeTab = ref<'branca' | 'branca_distancia' | 'fogo'>('branca');
const searchBranca = ref('');
const searchDistancia = ref('');
const searchFogo = ref('');

const filteredBranca = computed(() =>
  weapons.value
    .filter((w) => w.tipo === 'branca')
    .filter((w) => !searchBranca.value || w.nome.toLowerCase().includes(searchBranca.value.toLowerCase())),
);

const filteredDistancia = computed(() =>
  weapons.value
    .filter((w) => w.tipo === 'branca_distancia')
    .filter((w) => !searchDistancia.value || w.nome.toLowerCase().includes(searchDistancia.value.toLowerCase())),
);

const filteredFogo = computed(() =>
  weapons.value
    .filter((w) => w.tipo === 'fogo')
    .filter((w) => !searchFogo.value || w.nome.toLowerCase().includes(searchFogo.value.toLowerCase())),
);

const columnsBranca = computed<QTableColumn<Weapon>[]>(() => [
  { name: 'nome', label: t('pages.weapons.columns.name'), field: 'nome', sortable: true, align: 'left' },
  { name: 'categoria', label: t('pages.weapons.columns.category'), field: 'categoria', sortable: true, align: 'left' },
  { name: 'dano', label: t('pages.weapons.columns.damage'), field: 'dano', sortable: false, align: 'left' },
  { name: 'iniciativa', label: t('pages.weapons.columns.initiative'), field: 'iniciativa', sortable: true, align: 'left' },
  { name: 'tipoDano', label: t('pages.weapons.columns.damageType'), field: 'tipoDano', sortable: true, align: 'left' },
  { name: 'ocultabilidade', label: t('pages.weapons.columns.concealability'), field: 'ocultabilidade', sortable: true, align: 'left' },
]);

const columnsDistancia = computed<QTableColumn<Weapon>[]>(() => [
  { name: 'nome', label: t('pages.weapons.columns.name'), field: 'nome', sortable: true, align: 'left' },
  { name: 'categoria', label: t('pages.weapons.columns.category'), field: 'categoria', sortable: true, align: 'left' },
  { name: 'dano', label: t('pages.weapons.columns.damage'), field: 'dano', sortable: false, align: 'left' },
  { name: 'iniciativa', label: t('pages.weapons.columns.initiative'), field: 'iniciativa', sortable: true, align: 'left' },
  { name: 'alcanceMedio', label: t('pages.weapons.columns.mediumRange'), field: 'alcanceMedio', sortable: false, align: 'left' },
  { name: 'alcanceMax', label: t('pages.weapons.columns.maxRange'), field: 'alcanceMax', sortable: false, align: 'left' },
]);

const columnsFogo = computed<QTableColumn<Weapon>[]>(() => [
  { name: 'nome', label: t('pages.weapons.columns.name'), field: 'nome', sortable: true, align: 'left' },
  { name: 'categoria', label: t('pages.weapons.columns.category'), field: 'categoria', sortable: true, align: 'left' },
  { name: 'calibre', label: t('pages.weapons.columns.caliber'), field: 'calibre', sortable: true, align: 'left' },
  { name: 'dano', label: t('pages.weapons.columns.damage'), field: 'dano', sortable: false, align: 'left' },
  { name: 'alcanceEfetivo', label: t('pages.weapons.columns.effectiveRange'), field: 'alcanceEfetivo', sortable: false, align: 'left' },
  { name: 'rof', label: t('pages.weapons.columns.rof'), field: 'rof', sortable: false, align: 'left' },
  { name: 'pente', label: t('pages.weapons.columns.magazine'), field: 'pente', sortable: false, align: 'left' },
  { name: 'ocultabilidade', label: t('pages.weapons.columns.concealability'), field: 'ocultabilidade', sortable: true, align: 'left' },
]);

onMounted(async () => {
  await getAllWeapons();
});
</script>

<style scoped lang="scss">
.weapons-tabs {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
