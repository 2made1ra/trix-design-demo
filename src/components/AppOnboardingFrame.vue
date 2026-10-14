<template>
  <sp-page :side="side" :footer="footer">
    <div ref="root" class="flex flex-1 flex-col">
      <div class="split">
        <aside class="side glow" :class="{ 'min-h-130': tall }" data-rv>
          <router-link :to="home" class="brand self-start">TRIX</router-link>
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
import type { RouteLocationRaw } from 'vue-router'
import SpPage from '@/components/speaker/SpPage.vue'
import { useFx } from '@/composables/useFx'

withDefaults(
  defineProps<{
    /** Крупная цифра или слово у нижнего края панели */
    big: string
    sub?: string
    /** Шире плашка с большим текстом (регистрация) */
    wide?: boolean
    side?: 'sp' | 'co'
    /** Панель не ниже 520px: у онбординга организации карточка короткая */
    tall?: boolean
    /** Куда ведёт логотип в панели */
    home?: RouteLocationRaw
    footer?: 'full' | 'mini' | 'fork' | false
  }>(),
  { side: 'sp', home: '/', footer: false },
)

const root = useTemplateRef<HTMLElement>('root')
useFx(root, { words: 'onboarding', ink: true, blocks: true })
</script>
