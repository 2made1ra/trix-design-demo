<template>
  <section class="hero">
    <app-header variant="landing" :side="side" :anchors="anchors" />
    <div class="wrap pt-16">
      <div class="mb-7 flex flex-wrap items-center gap-x-6 gap-y-2.5" data-rv>
        <nav class="sw" aria-label="Для кого TRIX">
          <router-link :to="{ name: 'speakers.landing' }" class="pick">Спикерам</router-link>
          <router-link :to="{ name: 'companies.landing' }" class="pick">Компаниям</router-link>
        </nav>
        <span class="whisper">{{ whisper }}</span>
      </div>
      <h1 class="d-hero" data-rv :aria-label="`${headline} ${lines[0]}`">
        {{ headline }}
        <em ref="typed" aria-hidden="true">{{ typedText }}<i class="typing-caret" /></em>
      </h1>
      <div class="hero-foot">
        <p class="serif" data-rv>
          {{ lead }}
          <span class="muted">{{ leadMuted }}</span>
        </p>
        <div class="flex flex-wrap gap-3" data-rv>
          <router-link :to="cta.to" class="b b-ink">{{ cta.label }}<ArrowRight /></router-link>
          <router-link :to="{ hash: '#how' }" class="b b-line">Как это работает</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { ref, useTemplateRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useTyping } from '@/composables/useFx'

const props = defineProps<{
  side: 'sp' | 'co'
  anchors: { label: string; hash: string }[]
  whisper: string
  /** Первая строка заголовка, вторая печатается по кругу из lines */
  headline: string
  lines: string[]
  lead: string
  leadMuted: string
  cta: { label: string; to: RouteLocationRaw }
}>()

const typed = useTemplateRef<HTMLElement>('typed')
const typedText = ref(props.lines[0])
useTyping(typed, props.lines, (text) => {
  typedText.value = text
})
</script>
