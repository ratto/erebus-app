<template>
  <q-input
    v-model="model"
    :class="`erebus-input ${props.innerClass}`"
    :data-testid="props.dataTestid"
    debounce="300"
    dense
    clearable
    hide-bottom-space
  >
    <template v-for="(_, slot) in $slots" #[slot]>
      <slot :name="slot" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
const model = defineModel<string | number | null | undefined>();

interface Props {
  innerClass?: string;
  dataTestid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  innerClass: '',
  dataTestid: 'input-test',
});
</script>
