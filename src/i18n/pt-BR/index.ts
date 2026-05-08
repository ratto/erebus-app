import common from './common';
import pages from './pages';

export default {
  topbar: {
    menuAriaLabel: 'Menu',
  },
  nav: {
    navigation: 'Navegação',
    home: 'HOME',
    skills: 'PERÍCIAS',
    weapons: 'ARMAS',
    enhancements: 'APRIMORAMENTOS',
    items: 'ITENS',
    combatSkills: 'PERÍCIAS DE COMBATE',
    character: 'PERSONAGEM',
    protectiveEquipment: 'EQUIPAMENTOS DE PROTEÇÃO',
  },
  footer: {
    copyright: 'EREBUS ENGINE © 2026',
  },
  settings: {
    title: 'Configurações',
    language: 'Idioma',
    campaignScenario: 'Cenário de Campanha',
    gameType: 'Tipo de Jogo',
    scenarios: {
      contemporary: 'Contemporâneo',
      medieval: 'Medieval',
      futuristic: 'Futurístico',
    },
    gameTypes: {
      action: 'Action RPG',
      turn_based: 'Turn Based RPG',
    },
  },
  common,
  pages,
};
