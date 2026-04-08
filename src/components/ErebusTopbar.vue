<template>
  <q-header class="erebus-topbar">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="menu"
        :aria-label="$t('topbar.menuAriaLabel')"
        class="menu-toggle"
        @click="$emit('toggle-menu')"
      />
      <q-toolbar-title class="topbar-logo">EREBUS</q-toolbar-title>
      <q-btn-group flat class="lang-switcher">
        <q-btn
          flat dense
          label="PT"
          :class="{ 'lang-active': configStore.locale === 'pt-BR' }"
          @click="configStore.setLocale('pt-BR')"
        />
        <q-btn
          flat dense
          label="EN"
          :class="{ 'lang-active': configStore.locale === 'en-US' }"
          @click="configStore.setLocale('en-US')"
        />
      </q-btn-group>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { useConfigStore } from 'src/stores/config.store';

defineEmits<{ 'toggle-menu': [] }>();

const configStore = useConfigStore();
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

.lang-switcher {
  margin-left: auto;
}

.lang-active {
  color: var(--ember-300) !important;
}
</style>
