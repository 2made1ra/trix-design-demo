<template>
  <div
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="steps"
    :aria-valuenow="current"
    class="prog"
    :style="{ gridTemplateColumns: `repeat(${steps}, 1fr)` }"
  >
    <span v-for="n in steps" :key="n" :class="{ on: n <= current }" />
  </div>
</template>

<script setup lang="ts">
/** Прогресс шагов: полоса на каждый шаг, пройденные тёмные */
withDefaults(defineProps<{ current: number; label: string; steps?: number }>(), { steps: 3 })
</script>
