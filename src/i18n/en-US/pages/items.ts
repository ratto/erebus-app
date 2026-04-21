export default {
  title: 'Items',
  newItem: 'New Item',
  searchPlaceholder: 'Search by name...',
  typeLabel: 'Type',
  typeOptions: {
    all: 'All',
    mundane: 'Mundane',
    consumable: 'Consumable',
  },
  columns: {
    name: 'Name',
    type: 'Type',
    description: 'Description',
    actions: 'Actions',
  },
  noData: 'No items registered.',
  noDataFiltered: 'No items found for the applied filters.',
  badge: {
    mundane: 'Mundane',
    consumable: 'Consumable',
  },
  dialog: {
    titleCreate: 'New Item',
    titleEdit: 'Edit Item',
    fieldName: 'Name',
    fieldType: 'Type',
    fieldDescription: 'Description',
    save: 'Save',
    cancel: 'Cancel',
    validation: {
      nameRequired: 'Name is required.',
      nameMaxLength: 'Name must be at most 80 characters.',
      typeRequired: 'Type is required.',
      descriptionMaxLength: 'Description must be at most 500 characters.',
    },
  },
  deleteDialog: {
    title: 'Remove Item',
    message: 'Do you want to remove the item',
    confirm: 'Remove',
    cancel: 'Cancel',
  },
  notify: {
    created: 'Item created successfully.',
    updated: 'Item updated successfully.',
    removed: 'Item removed successfully.',
  },
};
