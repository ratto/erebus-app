<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md row q-gutter-md items-end">
      <q-input
        v-model="searchText"
        dense
        debounce="300"
        :placeholder="t('pages.items.searchPlaceholder')"
        clearable
        class="col-12 col-sm-4"
        data-testid="search-input"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        v-model="selectedType"
        :options="typeFilterOptions"
        dense
        :label="t('pages.items.typeLabel')"
        emit-value
        map-options
        class="col-12 col-sm-3"
        data-testid="select-type"
      />

      <div class="col-grow row justify-end">
        <q-btn
          unelevated
          icon="add"
          :label="t('pages.items.newItem')"
          color="primary"
          @click="openCreateDialog"
          data-testid="btn-new-item"
        />
      </div>
    </div>

    <erebus-table
      :rows="filteredItems"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :no-data-label="noDataMessage"
    >
      <template #body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">{{ props.row.name }}</q-td>
          <q-td key="type" :props="props">
            <q-badge
              :color="props.row.type === 'consumable' ? 'deep-orange' : 'blue-grey'"
              :label="typeBadgeLabel(props.row.type)"
            />
          </q-td>
          <q-td key="description" :props="props" class="description-cell">
            {{ props.row.description || '—' }}
          </q-td>
          <q-td key="actions" :props="props" class="actions-cell">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="grey"
              @click="openEditDialog(props.row)"
              :data-testid="`btn-edit-${props.row.id}`"
            >
              <q-tooltip>{{ t('pages.items.dialog.titleEdit') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="openDeleteDialog(props.row)"
              :data-testid="`btn-delete-${props.row.id}`"
            >
              <q-tooltip>{{ t('pages.items.deleteDialog.title') }}</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </erebus-table>

    <item-form-dialog
      v-model="formDialogOpen"
      :mode="formMode"
      v-bind="selectedItem ? { item: selectedItem } : {}"
      @confirm="handleFormConfirm"
    />

    <delete-item-dialog
      v-if="itemToDelete"
      v-model="deleteDialogOpen"
      :item="itemToDelete"
      @confirm="handleDeleteConfirm"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { type QTableColumn } from 'quasar';
import ErebusTable from 'src/components/common/ErebusTable.vue';
import { storeToRefs } from 'pinia';
import { useItemsStore } from 'src/stores/items.store';
import type { Item, ItemInput, ItemType } from 'src/model/types/item.type';
import ItemFormDialog from 'src/components/items-page/ItemFormDialog.vue';
import DeleteItemDialog from 'src/components/items-page/DeleteItemDialog.vue';
import { erebusMessage } from 'src/model/utils/message';

const { t } = useI18n();
const notify = erebusMessage();
const store = useItemsStore();
const { items } = storeToRefs(store);

// ── filtros ──────────────────────────────────────────────────────────────────

const searchText = ref('');
const selectedType = ref<ItemType | ''>('');

const typeFilterOptions = computed(() => [
  { label: t('pages.items.typeOptions.all'), value: '' },
  { label: t('pages.items.typeOptions.mundane'), value: 'mundane' },
  { label: t('pages.items.typeOptions.consumable'), value: 'consumable' },
]);

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const matchName =
      !searchText.value || item.name.toLowerCase().includes(searchText.value.toLowerCase());
    const matchType = !selectedType.value || item.type === selectedType.value;
    return matchName && matchType;
  });
});

const hasActiveFilter = computed(() => !!searchText.value || !!selectedType.value);

const noDataMessage = computed(() =>
  hasActiveFilter.value ? t('pages.items.noDataFiltered') : t('pages.items.noData'),
);

// ── tabela ────────────────────────────────────────────────────────────────────

const pagination = ref({ page: 1, rowsPerPage: 15 });

const columns = computed<QTableColumn[]>(() => [
  { name: 'name', label: t('pages.items.columns.name'), field: 'name', sortable: true, align: 'left' },
  { name: 'type', label: t('pages.items.columns.type'), field: 'type', sortable: true, align: 'center' },
  { name: 'description', label: t('pages.items.columns.description'), field: 'description', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]);

function typeBadgeLabel(type: ItemType): string {
  return type === 'mundane' ? t('pages.items.badge.mundane') : t('pages.items.badge.consumable');
}

// ── dialogs ───────────────────────────────────────────────────────────────────

const formDialogOpen = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const selectedItem = ref<Item | undefined>(undefined);

const deleteDialogOpen = ref(false);
const itemToDelete = ref<Item | undefined>(undefined);

function openCreateDialog(): void {
  formMode.value = 'create';
  selectedItem.value = undefined;
  formDialogOpen.value = true;
}

function openEditDialog(item: Item): void {
  formMode.value = 'edit';
  selectedItem.value = item;
  formDialogOpen.value = true;
}

function openDeleteDialog(item: Item): void {
  itemToDelete.value = item;
  deleteDialogOpen.value = true;
}

function handleFormConfirm(input: ItemInput): void {
  if (formMode.value === 'create') {
    store.addItem(input);
    notify.success(t('pages.items.notify.created'));
  } else if (selectedItem.value) {
    store.updateItem(selectedItem.value.id, input);
    notify.success(t('pages.items.notify.updated'));
  }
  formDialogOpen.value = false;
}

function handleDeleteConfirm(): void {
  if (!itemToDelete.value) return;
  store.removeItem(itemToDelete.value.id);
  notify.success(t('pages.items.notify.removed'));
  itemToDelete.value = undefined;
}
</script>

<style scoped lang="scss">
.description-cell {
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--bone-600);
}

.actions-cell {
  white-space: nowrap;
}
</style>
