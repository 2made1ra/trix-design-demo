<template>
  <sp-page :footer="false">
    <div ref="root" class="flex flex-1 flex-col">
      <div class="split">
        <aside class="side glow" data-rv>
          <router-link to="/" class="brand self-start">TRIX</router-link>
          <div class="float bob flex flex-col p-7" :class="wide ? 'max-w-100 gap-4.5' : 'max-w-95 gap-4'">
            <slot name="float" />
          </div>
          <span class="big" aria-hidden="true">{{ big }}<span>{{ sub }}</span></span>
        </aside>

        <main class="split-main">
          <slot />
        </main>
      </div>
      <slot name="footer" />
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import SpPage from '@/components/speaker/SpPage.vue'
import { useFx } from '@/composables/useFx'

defineProps<{
  /** Крупная цифра или слово у нижнего края панели */
  big: string
  sub?: string
  /** Шире плашка с большим текстом (регистрация) */
  wide?: boolean
}>()

const root = useTemplateRef<HTMLElement>('root')
useFx(root, { words: 'onboarding', ink: true, blocks: true })
</script>
