<template>
  <q-page id="weapons-page" class="erebus-page q-pa-md">
    <h1>{{ t('pages.weapons.title') }}</h1>
    <div class="subtitle">
      {{ t('pages.weapons.subtitle') }}
    </div>

    <q-tabs v-model="activeTab" dense align="left" class="weapons-tabs q-mb-md">
      <q-tab name="meelee" label="Brancas" />
      <q-tab name="ranged" label="À Distância" />
      <q-tab name="firearm" label="Fogo" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated keep-alive>
      <q-tab-panel name="meelee" class="q-pa-none">
        <tab-meelee-weapons />
      </q-tab-panel>

      <q-tab-panel name="ranged" class="q-pa-none">
        <tab-ranged-weapons />
      </q-tab-panel>

      <q-tab-panel name="firearm" class="q-pa-none">
        <tab-firearm-weapons />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TabMeeleeWeapons from 'src/components/weapons-page/TabMeeleeWeapons.vue';
import TabRangedWeapons from 'src/components/weapons-page/TabRangedWeapons.vue';
import TabFirearmWeapons from 'src/components/weapons-page/TabFirearmWeapons.vue';

const { t } = useI18n();

const activeTab = ref<'meelee' | 'ranged' | 'firearm'>('meelee');
</script>

<style scoped lang="scss">
.weapons-tabs {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
