<template>
  <div class="win-top">
    <span class="h-24">{{ title }}</span>
    <span v-if="note" class="k muted">{{ note }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; note?: string }>()
</script>
