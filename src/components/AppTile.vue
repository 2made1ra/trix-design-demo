<template>
  <router-link v-if="to" :to="to" class="tile" :class="tone"><slot /></router-link>
  <component :is="as" v-else class="tile" :class="tone"><slot /></component>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { TileTone } from '@/components/tones'

withDefaults(
  defineProps<{
    tone?: TileTone | null
    as?: 'div' | 'section' | 'article' | 'figure' | 'li' | 'p' | 'form'
    /** Плитка-ссылка: рендерится как `router-link` */
    to?: RouteLocationRaw
  }>(),
  { tone: null, as: 'div' },
)
</script>
