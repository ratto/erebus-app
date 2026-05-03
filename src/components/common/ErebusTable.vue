<template>
  <q-table
    class="erebus-table"
    :rows="props.rows"
    :columns="props.columns"
    :row-key="props.rowKey"
    :loading="props.loading"
    :rows-per-page-options="props.rowsPerPageOptions"
    :filter="props.filter"
    :filter-method="props.filterMethod"
    :pagination="props.pagination"
    @update:pagination="emit('update:pagination', $event)"
  >
    <template v-for="(_, slot) in slotsWithoutNoData" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps ?? {}" />
    </template>

    <template #no-data>
      <slot name="no-data">
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-md">
          <q-icon size="2em" name="search_off" />
          <span>{{ props.noDataLabel }}</span>
        </div>
      </slot>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { type QTableColumn } from 'quasar';

interface ErebusTableProps {
  rows?: readonly unknown[];
  columns?: QTableColumn[];
  rowKey?: string;
  loading?: boolean;
  rowsPerPageOptions?: number[];
  noDataLabel?: string;
  filter?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterMethod?: ((...args: any[]) => any) | undefined;
  pagination?: {
    page?: number;
    rowsPerPage?: number;
    sortBy?: string;
    descending?: boolean;
    rowsNumber?: number;
  };
}

const props = withDefaults(defineProps<ErebusTableProps>(), {
  rows: () => [],
  columns: () => [],
  rowKey: 'id',
  loading: false,
  rowsPerPageOptions: () => [10, 15, 25, 50],
  noDataLabel: 'Nenhum resultado encontrado.',
});

const emit = defineEmits<{
  'update:pagination': [value: object];
}>();

const slots = useSlots();

const slotsWithoutNoData = computed(() =>
  Object.fromEntries(Object.entries(slots).filter(([name]) => name !== 'no-data')),
);
</script>
