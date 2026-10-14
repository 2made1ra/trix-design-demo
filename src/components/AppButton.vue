<template>
  <router-link v-if="to" :to="to" :class="classes"><slot /></router-link>
  <!-- biome-ignore lint/a11y/useAnchorContent: текст ссылки приходит через слот -->
  <a v-else-if="href" :href="href" :class="classes"><slot /></a>
  <span v-else-if="as === 'span'" :class="classes"><slot /></span>
  <button v-else :type="type" :class="classes"><slot /></button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    /** Заливка: `mint` — главная, `ink` — тёмная, `line` — контурная */
    variant?: 'mint' | 'ink' | 'line' | 'uv'
    sm?: boolean
    /** Внутренняя ссылка: рендерится как `router-link` */
    to?: RouteLocationRaw
    /** Внешняя ссылка: рендерится как `a` */
    href?: string
    /** `span` — только вид кнопки, когда кликается обёртка-ссылка */
    as?: 'span'
    type?: 'button' | 'submit'
  }>(),
  { type: 'button' },
)

const classes = computed(() => ['b', props.variant && `b-${props.variant}`, { 'b-sm': props.sm }])
</script>
