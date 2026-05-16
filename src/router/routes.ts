import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'Index', component: () => import('pages/IndexPage.vue') },
      { path: 'pericias', name: 'Skills', component: () => import('pages/SkillsPage.vue') },
      { path: 'armas', name: 'Weapons', component: () => import('pages/WeaponsPage.vue') },
      { path: 'aprimoramentos', name: 'Enhancements', component: () => import('pages/EnhancementsPage.vue') },
      { path: 'itens', name: 'Items', component: () => import('pages/ItemsPage.vue') },
      { path: 'pericias-de-combate', name: 'CombatSkills', component: () => import('pages/CombatSkillsPage.vue') },
      { path: 'personagem', name: 'Character', component: () => import('pages/CharacterPage.vue') },
      { path: 'equipamentos-protecao', name: 'ProtectiveEquipment', component: () => import('pages/ProtectiveEquipmentPage.vue') },
      { path: 'capacidade', name: 'Capacity', component: () => import('pages/CapacityPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
