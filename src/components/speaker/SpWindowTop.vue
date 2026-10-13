<template>
  <div class="flex items-center justify-between gap-4">
    <span class="text-2xl leading-[1.05] font-bold">{{ title }}</span>
    <span v-if="note" class="kicker text-ink-2">{{ note }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; note?: string }>()
</script>
