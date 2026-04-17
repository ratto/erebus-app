<template>
  <q-page class="page-home">
    <h1 class="page-title">{{ $t('pages.home.title') }}</h1>
    <p class="page-body">{{ $t('pages.home.intro1') }}</p>
    <p class="page-body">{{ $t('pages.home.intro2') }}</p>
  </q-page>
</template>

<script setup lang="ts">
// vue-i18n expõe $t automaticamente no template via app.use(i18n)
</script>

<style scoped lang="scss">
.page-home {
  padding: var(--sp-16) var(--sp-12);
  max-width: 56.25rem;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--bone-900);
  margin-bottom: var(--sp-6);
}

.page-body {
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.75;
  color: var(--bone-800);
  margin-bottom: var(--sp-4);
}
</style>
