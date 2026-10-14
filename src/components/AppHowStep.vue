<template>
  <app-tile as="li" tone="slate" data-rv>
    <div class="mock" aria-hidden="true"><slot /></div>
    <div class="how-txt">
      <span class="k muted">Шаг {{ step }}</span>
      <h3 class="h-24">{{ title }}</h3>
      <p class="muted">{{ text }}</p>
    </div>
  </app-tile>
</template>

<script setup lang="ts">
import AppTile from '@/components/AppTile.vue'

defineProps<{ step: number; title: string; text: string }>()
</script>
