<template>
  <org-split>
    <template #card>
      <span class="kicker text-ink-2">Шаг {{ step }} из 3</span>
      <div
        role="progressbar"
        aria-label="Онбординг организации"
        aria-valuemin="0"
        aria-valuemax="3"
        :aria-valuenow="step"
        class="grid grid-cols-3 gap-1.5"
      >
        <span v-for="n in 3" :key="n" class="h-1 rounded-sm" :class="n <= step ? 'bg-ink' : 'bg-line'" />
      </div>
      <p class="text-sm text-ink-2">{{ hint }}</p>
    </template>
    <template #big> 0{{ step }}<span class="font-light text-ink/30">/03</span> </template>

    <div class="flex flex-col gap-4" data-rv>
      <span class="tag fill-lime self-start">Онбординг организации</span>
      <h1 class="shout text-d1">{{ title }}</h1>
      <p class="text-xl leading-[1.55] text-ink-2">{{ description }}</p>
    </div>
    <slot />

    <template #footer>
      <footer
        class="relative mx-4 grid items-end gap-x-12 gap-y-4 pt-5 pb-7 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-line sm:mx-8 md:grid-cols-[minmax(0,1fr)_auto]"
      >
        <ol aria-label="Шаги онбординга" class="grid grid-cols-3 gap-1.5">
          <li
            v-for="(name, i) in ['Организация', 'Команда', 'Спикеры']"
            :key="name"
            class="relative flex flex-col gap-1 before:absolute before:inset-x-0 before:-top-5.25 before:h-0.75 before:rounded-xs"
            :class="i + 1 < step ? 'text-ink-2 before:bg-ink/40' : i + 1 === step ? 'text-ink before:bg-ink' : 'text-quiet'"
            :aria-current="i + 1 === step ? 'step' : undefined"
          >
            <span class="kicker"
              >0{{ i + 1 }}<CheckIcon v-if="i + 1 < step" class="ml-1 inline size-3 align-[-1px]" /></span
            >
            <b class="text-[15px] font-medium">{{ name }}</b>
          </li>
        </ol>
        <div class="kicker flex flex-wrap gap-x-6 gap-y-2 text-ink-2"><slot name="links" /></div>
      </footer>
    </template>
  </org-split>
</template>

<script setup lang="ts">
import { CheckIcon } from '@lucide/vue'
import OrgSplit from '@/components/org/OrgSplit.vue'

defineProps<{ step: 1 | 2 | 3; title: string; description: string; hint: string }>()
</script>
