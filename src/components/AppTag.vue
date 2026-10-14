<template>
  <component :is="as" class="tag" :class="tone"><slot /></component>
</template>

<script setup lang="ts">
import type { TagTone } from '@/components/tones'

withDefaults(defineProps<{ tone?: TagTone | null; as?: 'span' | 'li' }>(), { tone: null, as: 'span' })
</script>
