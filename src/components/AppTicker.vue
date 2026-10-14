<template>
  <div class="wrap" data-rv>
    <div class="ticker" :class="{ ink }" aria-hidden="true">
      <div class="tk ticker-track">
        <template v-for="item in items" :key="item">
          <span>{{ item }}</span>
          <i />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: string[]; ink?: boolean }>()
</script>
