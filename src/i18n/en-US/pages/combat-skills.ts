export default {
  title: 'Combat Skills',
  subtitle:
    'Browse the Combat Skills of the Daemon System. Each skill has independent Attack and Defense values, with specific cost rules per type: Melee (1:1), Ranged (2:1 attack only) and Shield (2:1 defense only).',
  filters: {
    search: {
      label: 'Skill',
      placeholder: 'Search by name...',
    },
    selectType: {
      label: 'Type',
    },
    selectAttribute: {
      label: 'Base Attribute',
    },
  },
  types: {
    melee: 'Melee',
    ranged: 'Ranged',
    shield: 'Shield',
  },
  columns: {
    name: 'Name',
    type: 'Type',
    attackAttribute: 'Atk. Base',
    defenseAttribute: 'Def. Base',
    requirement: 'Requirement',
  },
  noData: 'No combat skills found for the applied filters.',
};
