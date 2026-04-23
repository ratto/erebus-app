import common from './common';
import pages from './pages';

export default {
  topbar: {
    menuAriaLabel: 'Menu',
  },
  nav: {
    navigation: 'Navigation',
    home: 'HOME',
    skills: 'SKILLS',
    weapons: 'WEAPONS',
    enhancements: 'ENHANCEMENTS',
    items: 'ITEMS',
  },
  footer: {
    copyright: 'EREBUS ENGINE © 2026',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    campaignScenario: 'Campaign Scenario',
    gameType: 'Game Type',
    scenarios: {
      contemporary: 'Contemporary',
      medieval: 'Medieval',
      futuristic: 'Futuristic',
    },
    gameTypes: {
      action: 'Action RPG',
      turn_based: 'Turn Based RPG',
    },
  },
  common,
  pages,
};
