<template>
  <section id="faq" class="st stream-item scroll-mt-6" aria-labelledby="faq-title">
    <sp-stream-label label="Вопросы" number="08" />
    <div class="row2" data-rv>
      <div class="faq">
        <details v-for="(item, i) in items" :key="item.question" :open="i === 0">
          <summary>
            <span class="h-24">{{ item.question }}</span><i aria-hidden="true" />
          </summary>
          <p class="muted">{{ item.answer }}</p>
        </details>
      </div>
      <div class="flex flex-col gap-4">
        <h2 id="faq-title" class="d-3">Остались вопросы?</h2>
        <p class="deck"><slot /></p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import SpStreamLabel from '@/components/speaker/SpStreamLabel.vue'

defineProps<{ items: { question: string; answer: string }[] }>()
</script>
