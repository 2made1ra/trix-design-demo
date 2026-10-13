<template>
  <div class="scene-bar" :data-s="step">
    <i />
    <span class="kicker text-ink-2">
      <span :data-s="`${step}-${step}`">{{ busy }}</span>
      <span :data-s="step + 1">{{ done }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ step: number; busy: string; done: string }>()
</script>
