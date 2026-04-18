export default {
  title: 'Itens',
  newItem: 'Novo Item',
  searchPlaceholder: 'Buscar por nome...',
  typeLabel: 'Tipo',
  typeOptions: {
    all: 'Todos',
    mundane: 'Mundano',
    consumable: 'Consumível',
  },
  columns: {
    name: 'Nome',
    type: 'Tipo',
    description: 'Descrição',
    actions: 'Ações',
  },
  noData: 'Nenhum item cadastrado.',
  noDataFiltered: 'Nenhum item encontrado para os filtros aplicados.',
  badge: {
    mundane: 'Mundano',
    consumable: 'Consumível',
  },
  dialog: {
    titleCreate: 'Novo Item',
    titleEdit: 'Editar Item',
    fieldName: 'Nome',
    fieldType: 'Tipo',
    fieldDescription: 'Descrição',
    save: 'Salvar',
    cancel: 'Cancelar',
    validation: {
      nameRequired: 'Nome é obrigatório.',
      nameMaxLength: 'Nome deve ter no máximo 80 caracteres.',
      typeRequired: 'Tipo é obrigatório.',
      descriptionMaxLength: 'Descrição deve ter no máximo 500 caracteres.',
    },
  },
  deleteDialog: {
    title: 'Remover Item',
    message: 'Deseja remover o item',
    confirm: 'Remover',
    cancel: 'Cancelar',
  },
  notify: {
    created: 'Item criado com sucesso.',
    updated: 'Item atualizado com sucesso.',
    removed: 'Item removido com sucesso.',
  },
};
