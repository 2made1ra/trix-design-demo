<template>
  <!-- biome-ignore lint/a11y/noLabelWithoutControl: подпись приходит через слот -->
  <label v-if="type" class="pick">
    <input v-model="model" :type="type" :name="name" :value="value">
    <slot />
  </label>
  <router-link v-else-if="to" :to="to" class="pick"><slot /></router-link>
  <button v-else-if="pressed !== undefined" type="button" class="pick" :aria-pressed="pressed"><slot /></button>
  <span v-else class="pick"><slot /></span>
</template>

<script setup lang="ts" generic="T">
import type { RouteLocationRaw } from 'vue-router'

/**
 * Чип-фильтр. Вид выбирают пропсы:
 * `type` + `v-model` — радио или чекбокс, `pressed` — кнопка-переключатель,
 * `to` — ссылка, без них — статичный чип (иллюстрации лендингов).
 */
withDefaults(
  defineProps<{
    type?: 'radio' | 'checkbox'
    value?: T
    name?: string
    pressed?: boolean
    to?: RouteLocationRaw
  }>(),
  { pressed: undefined },
)

const model = defineModel<T | T[]>()
</script>
