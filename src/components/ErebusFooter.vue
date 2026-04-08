<template>
  <footer class="erebus-footer">
    <span class="footer-text">{{ $t('footer.copyright') }}</span>
  </footer>
</template>

<script setup lang="ts">
// vue-i18n expõe $t automaticamente no template via app.use(i18n)
</script>

<style scoped lang="scss">
.erebus-footer {
  background: var(--void-800);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding: var(--sp-4) var(--sp-6);
  text-align: center;
}

.footer-text {
  font-family: var(--font-heading);
  font-size: 0.625rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--bone-500);
}
</style>
