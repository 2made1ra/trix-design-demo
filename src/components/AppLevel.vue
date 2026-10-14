<template>
  <label class="lvl">
    <input v-model="model" type="radio" :name="name" :value="value">
    <span class="lvl-tick"><Check /></span>
    <slot />
    <span class="h-20">{{ title }}</span>
    <span class="small muted">{{ text }}</span>
  </label>
</template>

<script setup lang="ts" generic="T">
import { Check } from '@lucide/vue'

/** Карточка выбора онбординга: радио с галочкой, в слоте — иконка или полоски уровня */
defineProps<{ value: T; name: string; title: string; text: string }>()

const model = defineModel<T>()
</script>
