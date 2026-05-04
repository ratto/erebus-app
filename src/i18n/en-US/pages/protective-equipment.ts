export default {
  title: 'Protective Equipment',
  subtitle:
    'Browse armor and defensive equipment from the Daemon System. Filter by protected damage type and attribute penalties.',
  filters: {
    equipment: 'Search by name...',
    damageType: 'Damage type',
    minDexPenalty: 'DEX Pen. min.',
    maxDexPenalty: 'DEX Pen. max.',
    minAgiPenalty: 'AGI Pen. min.',
    maxAgiPenalty: 'AGI Pen. max.',
    clearFilters: 'Clear filters',
  },
  noData: 'No equipment found.',
  columns: {
    name: 'Name',
    dexPenalty: 'DEX Pen.',
    agiPenalty: 'AGI Pen.',
    description: 'Description',
    source: 'Source',
  },
};
