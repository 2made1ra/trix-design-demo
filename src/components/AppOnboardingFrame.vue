<template>
  <sp-page>
    <div ref="root" class="flex flex-1 flex-col">
      <div class="grid flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <aside class="glow-block @container m-4 flex flex-col justify-between gap-10 p-6 sm:p-10 lg:mr-0" data-rv>
          <router-link to="/" class="brand self-start text-ink hover:text-ink">TRIX</router-link>
          <div
            class="float flex max-w-95 animate-[bob_7s_ease-in-out_infinite] flex-col gap-4 p-7 motion-reduce:animate-none"
          >
            <slot name="float" />
          </div>
          <span
            class="hidden text-[38cqi] leading-[0.74] font-bold tracking-[-0.05em] whitespace-nowrap text-ink/90 lg:block"
            aria-hidden="true"
          >
            {{ big }}<span class="font-light text-ink/30">{{ sub }}</span>
          </span>
        </aside>

        <main class="flex max-w-215 min-w-0 flex-col gap-12 px-4 pt-[clamp(40px,8vh,120px)] pb-14 sm:px-10 xl:px-24">
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
}>()

const root = useTemplateRef<HTMLElement>('root')
useFx(root, { words: 'onboarding', ink: true, blocks: true })
</script>
