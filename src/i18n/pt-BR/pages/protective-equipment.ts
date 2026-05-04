export default {
  title: 'Equipamentos de Proteção',
  subtitle:
    'Consulte armaduras e equipamentos defensivos do Sistema Daemon. Filtre por tipo de dano protegido e penalidades de atributo.',
  filters: {
    equipment: 'Buscar por nome...',
    damageType: 'Tipo de dano',
    minDexPenalty: 'DEX Pen. mín.',
    maxDexPenalty: 'DEX Pen. máx.',
    minAgiPenalty: 'AGI Pen. mín.',
    maxAgiPenalty: 'AGI Pen. máx.',
    clearFilters: 'Limpar filtros',
  },
  noData: 'Nenhum equipamento encontrado.',
  columns: {
    name: 'Nome',
    dexPenalty: 'DEX Pen.',
    agiPenalty: 'AGI Pen.',
    description: 'Descrição',
    source: 'Fonte',
  },
};
