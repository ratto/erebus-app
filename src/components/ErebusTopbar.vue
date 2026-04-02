<template>
  <q-header class="erebus-topbar">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        class="menu-toggle"
        @click="$emit('toggle-menu')"
      />
      <q-toolbar-title class="topbar-logo">EREBUS</q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
defineEmits<{ 'toggle-menu': [] }>();
</script>

<style scoped lang="scss">
.erebus-topbar {
  background: var(--void-800);
  border-bottom: 1px solid rgba(232, 93, 26, 0.15);
}

.topbar-logo {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ember-300);
  letter-spacing: 0.15em;
}

.menu-toggle {
  color: var(--bone-600);

  &:hover {
    color: var(--bone-800);
  }
}
</style>
