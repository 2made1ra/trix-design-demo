<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full font-mono font-bold tracking-wider"
    :class="[small ? 'size-9 text-[11px]' : 'size-10 text-xs', tones[tone ?? 'mint']]"
    aria-hidden="true"
    >{{
      initials
    }}</span
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name: string; tone?: keyof typeof tones; small?: boolean }>()

const tones = {
  mint: 'fill-mint',
  lime: 'fill-lime',
  yellow: 'fill-yellow',
  pink: 'fill-pink',
  orange: 'fill-orange',
  plain: 'bg-ink text-paper',
}

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join(''),
)
</script>
