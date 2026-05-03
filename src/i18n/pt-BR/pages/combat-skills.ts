export default {
  title: 'Perícias de Combate',
  subtitle:
    'Consulte as Perícias de Combate do Sistema Daemon. Cada perícia possui Ataque e Defesa independentes, com regras de custo específicas por tipo: Corpo a Corpo (1:1), À Distância (2:1 só ataque) e Escudo (2:1 só defesa).',
  filters: {
    search: {
      label: 'Perícia',
      placeholder: 'Buscar por nome...',
    },
    selectType: {
      label: 'Tipo',
    },
    selectAttribute: {
      label: 'Atributo Base',
    },
  },
  types: {
    melee: 'Corpo a Corpo',
    ranged: 'À Distância',
    shield: 'Escudo',
  },
  columns: {
    name: 'Nome',
    type: 'Tipo',
    attackAttribute: 'Atq. Base',
    defenseAttribute: 'Def. Base',
    requirement: 'Requerimento',
  },
  noData: 'Nenhuma perícia de combate encontrada para os filtros aplicados.',
};
