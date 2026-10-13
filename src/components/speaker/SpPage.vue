<template>
  <div class="design design-mesh flex flex-col" :class="{ calm }">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ calm?: boolean }>(), { calm: true })
</script>
