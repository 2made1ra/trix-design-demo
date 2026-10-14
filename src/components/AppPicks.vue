<template>
  <component :is="as" class="picks"><slot /></component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ as?: 'div' | 'fieldset' }>(), { as: 'div' })
</script>
