<template>
  <q-layout view="hHh Lpr lFr">
    <ErebusTopbar
      @toggle-menu="toggleLeftDrawer"
      @toggle-chat="toggleRightDrawer"
      @toggle-settings="settingsOpen = !settingsOpen"
    />

    <MenuDrawer v-model="leftDrawerOpen" />

    <ChatDrawer v-model="rightDrawerOpen" />

    <SettingsDialog v-model="settingsOpen" />

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
import ChatDrawer from 'components/ChatDrawer.vue';
import SettingsDialog from 'components/SettingsDialog.vue';

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const settingsOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}
</script>
