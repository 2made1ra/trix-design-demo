<template>
  <div class="st-time k">
    {{ label }}<b>{{ number }}</b>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; number: string }>()
</script>
