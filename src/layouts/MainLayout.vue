<template>
  <q-layout view="lHh Lpr lFf">
    <TheTopbar @toggle-drawer="toggleLeftDrawer" />

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="260"
      class="erebus-drawer"
    >
      <q-list>
        <q-item-label class="drawer-section-title">Navegação</q-item-label>

        <q-item
          clickable
          :to="{ name: 'Index' }"
          active-class="nav-item-active"
          class="nav-item"
        >
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>HOME</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
      <TheFooter />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TheTopbar from 'components/TheTopbar.vue';
import TheFooter from 'components/TheFooter.vue';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style lang="scss">
.erebus-drawer {
  background: var(--void-800) !important;
  border-right: 1px solid rgba(232, 93, 26, 0.15) !important;
}

.drawer-section-title {
  font-family: var(--font-heading);
  font-size: 0.5625rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--bone-500);
  padding: var(--sp-4) var(--sp-6) var(--sp-2);
}

.nav-item {
  font-family: var(--font-heading);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bone-700);
  border-left: 2px solid transparent;
  transition:
    color var(--anim-fast),
    background var(--anim-fast);

  .q-icon {
    color: var(--bone-600);
    font-size: 1.125rem;
  }

  &:hover {
    color: var(--ember-300);
    background: rgba(232, 93, 26, 0.06) !important;
    border-left-color: var(--ember-500);

    .q-icon {
      color: var(--ember-300);
    }
  }
}

.nav-item-active {
  color: var(--ember-300) !important;
  background: rgba(232, 93, 26, 0.08) !important;
  border-left-color: var(--ember-400) !important;

  .q-icon {
    color: var(--ember-300) !important;
  }
}
</style>
