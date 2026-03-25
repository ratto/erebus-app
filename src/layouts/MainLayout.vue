<template>
  <q-layout view="hHh Lpr lFr">
    <ErebusTopbar @toggle-drawer="toggleLeftDrawer" />

    <MenuDrawer v-model="leftDrawerOpen" />

    <q-page-container>
      <router-view />
    </q-page-container>

    <ErebusFooter />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ErebusTopbar from 'components/ErebusTopbar.vue';
import ErebusFooter from 'components/ErebusFooter.vue';
import MenuDrawer from 'components/MenuDrawer.vue';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
