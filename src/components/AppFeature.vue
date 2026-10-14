<template>
  <section :id="id" class="st stream-item scroll-mt-6" :aria-labelledby="`${id}-title`">
    <sp-stream-label :label="label" :number="number" />
    <div class="feat pb-12" :class="{ flip }">
      <div class="txt" data-rv>
        <app-tag class="self-start" :tone="tone">{{ tag }}</app-tag>
        <h2 :id="`${id}-title`" class="d-3">{{ title }}</h2>
        <p class="deck">{{ text }}</p>
        <ul class="ticks small">
          <li v-for="tick in ticks" :key="tick">{{ tick }}</li>
        </ul>
        <slot name="cta" />
      </div>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import AppTag from '@/components/AppTag.vue'
import SpStreamLabel from '@/components/speaker/SpStreamLabel.vue'

defineProps<{
  id: string
  /** Подпись слева от рельса и номер блока */
  label: string
  number: string
  tag: string
  /** Цвет метки: мята у спикеров, лайм у компаний */
  tone: 'mint' | 'lime'
  title: string
  text: string
  ticks: readonly string[]
  flip?: boolean
}>()
</script>
