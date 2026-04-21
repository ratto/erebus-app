<template>
  <q-select
    v-model="model"
    :class="`erebus-select ${props.innerClass}`"
    :options="props.options"
    dense
    clearable
    emit-value
    map-options
    :data-testid="dataTestid"
  />
</template>

<script setup lang="ts">
import { type BaseOption } from 'src/utils/options';

const model = defineModel();

interface Props {
  options: Array<string | BaseOption>;
  innerClass?: string;
  dataTestid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  innerClass: '',
  dataTestid: 'select-test',
});
</script>
