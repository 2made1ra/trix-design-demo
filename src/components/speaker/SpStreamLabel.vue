<template>
  <div class="kicker pt-3.5 text-ink-2 md:text-right">
    {{ label }}
    <b
      class="mt-3.5 block font-sans text-[clamp(36px,3.2vw,44px)] leading-none font-bold tracking-[-0.03em] text-ink normal-case"
      >{{
        number
      }}</b
    >
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; number: string }>()
</script>
