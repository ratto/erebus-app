<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md row q-gutter-md items-end">
      <q-input
        v-model="searchText"
        dense
        debounce="300"
        :placeholder="t('pages.skills.searchPlaceholder')"
        clearable
        class="col-12 col-sm-4"
        data-testid="search-input"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        v-model="selectedGrupo"
        :options="grupoOptions"
        dense
        clearable
        :label="t('pages.skills.groupLabel')"
        emit-value
        map-options
        class="col-12 col-sm-3"
        data-testid="select-grupo"
      />

      <q-select
        v-model="selectedAtributo"
        :options="atributoOptions"
        dense
        clearable
        :label="t('pages.skills.attributeLabel')"
        emit-value
        map-options
        class="col-12 col-sm-3"
        data-testid="select-atributo"
      />
    </div>

    <q-table
      :rows="skills"
      :columns="visibleColumnsConfig"
      row-key="id"
      v-model:pagination="pagination"
      :rows-per-page-options="[10, 15, 25, 50]"
      :filter="filterComputed"
      :filter-method="filterMethod"
      :loading="loading"
      class="skills-table"
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
          <q-td key="grupo" :props="props">{{ props.row.grupo ?? '—' }}</q-td>
          <q-td v-if="!$q.screen.lt.md" key="atributoBase" :props="props">{{
            props.row.atributoBase ?? '—'
          }}</q-td>
          <q-td key="apenasComTreinamento" :props="props">
            <q-badge v-if="!props.row.apenasComTreinamento" color="negattive" label="Não" />
            <q-badge v-else color="positive" label="Sim" />
          </q-td>
          <q-td v-if="!$q.screen.lt.md" key="sinergia" :props="props">{{
            props.row.sinergia ?? '—'
          }}</q-td>
        </q-tr>
        <q-tr v-if="expanded.has(props.row.id)" :props="props">
          <q-td colspan="100%" class="skill-description">
            {{ props.row.descricao }}
          </q-td>
        </q-tr>
      </template>

      <template #no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-md">
          <q-icon size="2em" name="search_off" />
          <span>{{ t('pages.skills.noData') }}</span>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { Skill } from 'src/model/types/skill.type';
import { useSkills } from 'src/composables/skills.composable';
import { attributeOptions } from 'src/utils/options';

const $q = useQuasar();
const { t } = useI18n();
const { loading, skills, getAllSkills } = useSkills();

const expanded = reactive(new Set<number>());

const searchText = ref('');
const selectedGrupo = ref<string | null>(null);
const selectedAtributo = ref<string | null>(null);

const pagination = ref({
  page: 1,
  rowsPerPage: 15,
});

const atributoOptions = [
  { label: '', value: null },
  { label: 'Nenhum', value: '__none__' },
  ...attributeOptions,
];

const grupoOptions = computed(() => {
  const grupos = new Set<string>();
  skills.value.forEach((s) => {
    if (s.grupo) grupos.add(s.grupo);
  });
  return [{ label: '', value: null }, ...[...grupos].sort().map((g) => ({ label: g, value: g }))];
});

const filterComputed = computed(() => ({
  nome: searchText.value,
  grupo: selectedGrupo.value,
  atributo: selectedAtributo.value,
}));

const allColumns = computed<QTableColumn[]>(() => [
  { name: 'expand', label: '', field: 'id', align: 'left' },
  { name: 'nome', label: t('pages.skills.columns.name'), field: 'nome', sortable: true, align: 'left' },
  { name: 'grupo', label: t('pages.skills.columns.group'), field: 'grupo', sortable: true, align: 'left' },
  { name: 'atributoBase', label: t('pages.skills.columns.baseAttribute'), field: 'atributoBase', sortable: true, align: 'left' },
  { name: 'apenasComTreinamento', label: t('pages.skills.columns.trainingOnly'), field: 'apenasComTreinamento', align: 'center' },
  { name: 'sinergia', label: t('pages.skills.columns.synergy'), field: 'sinergia', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]);

const visibleColumnsConfig = computed<QTableColumn[]>(() => {
  if ($q.screen.lt.md) {
    return allColumns.value.filter((c) => !['atributoBase', 'sinergia'].includes(c.name));
  }
  return allColumns.value;
});

function filterMethod(
  rows: readonly Skill[],
  terms: { nome: string; grupo: string | null; atributo: string | null },
): Skill[] {
  return (rows as Skill[]).filter((row) => {
    const matchNome = !terms.nome || row.nome.toLowerCase().includes(terms.nome.toLowerCase());
    const matchGrupo = !terms.grupo || row.grupo === terms.grupo;
    const matchAtributo =
      !terms.atributo ||
      (terms.atributo === '__none__'
        ? row.atributoBase === null
        : row.atributoBase === terms.atributo);
    return matchNome && matchGrupo && matchAtributo;
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
