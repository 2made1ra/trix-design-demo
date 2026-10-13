<template>
  <div class="bar" :data-s="step">
    <i />
    <span class="k muted">
      <span :data-s="`${step}-${step}`">{{ busy }}</span>
      <span :data-s="step + 1">{{ done }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ step: number; busy: string; done: string }>()
</script>
