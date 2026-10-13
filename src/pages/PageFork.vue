<template>
  <sp-page :calm="false">
    <div ref="root" class="flex h-[calc(100dvh-4.5rem)] min-h-160 flex-col overflow-hidden">
      <div
        class="kicker flex min-h-10 flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-[#131313] px-5 py-2 text-l-mint"
      >
        <span>TRIX в закрытой бете: для спикеров и компаний</span>
      </div>

      <section class="flex min-h-0 flex-1 flex-col">
        <app-header bare transparent />

        <div class="wrap flex min-h-0 flex-1 flex-col gap-6 pt-4 pb-5">
          <h1
            class="shout text-[clamp(56px,6vw,88px)] max-sm:text-[44px]"
            aria-label="TRIX — для тех, кто выходит на сцену, и для тех, кто выводит на сцену"
            data-rv
          >
            <span class="inline-block font-black tracking-[0.02em]"
              >TRIX<b
                class="ml-[0.05em] inline-block size-[0.15em] rounded-full bg-l-mint shadow-[0_0_0_1px_var(--l-mint-line),0_0_0.35em_var(--l-mint)]"
              /></span
            >
            &nbsp;для тех, кто
            <em
              class="mt-[0.06em] table rounded-[0.08em] px-[0.1em] pt-[0.02em] text-[#131313] not-italic transition-colors duration-500"
              :class="side === 'sp' ? 'bg-l-mint' : 'bg-[color-mix(in_oklch,var(--l-yellow)_62%,var(--l-mint))]'"
              aria-hidden="true"
              >вы<span ref="flip" class="inline-block origin-[50%_55%]">{{ letter }}</span>одит на сцену.</em
            >
          </h1>

          <nav class="flex min-h-0 flex-1 gap-4 max-sm:flex-col max-sm:gap-3" aria-label="Для кого TRIX">
            <router-link
              v-for="half in halves"
              :key="half.side"
              :to="half.to"
              class="tile flex min-w-0 flex-col items-start justify-end gap-3 p-8 transition-[flex-grow,filter] duration-600 ease-rise max-sm:p-5"
              :class="[
                half.surface,
                side === half.side ? 'flex-[1.25_1_0]' : 'flex-[0.9_1_0] saturate-[0.55] brightness-[1.04]',
              ]"
              data-rv
              @mouseenter="hover(half.side)"
              @focus="hover(half.side)"
              @mouseleave="release"
              @blur="release"
            >
              <div class="peek max-sm:hidden" aria-hidden="true">
                <div class="flex justify-between gap-3 px-1.5 pt-0.5 pb-1">
                  <span class="kicker">{{ half.peekTitle }}</span>
                  <span class="kicker text-ink-2">{{ half.peekNote }}</span>
                </div>
                <template v-if="half.side === 'sp'">
                  <div class="peek-row">
                    <span class="text-sm">Ссылка</span>
                    <b class="min-h-[1lh] font-semibold">{{ scene.typed }}</b>
                  </div>
                  <div class="peek-row" :class="{ on: shown('sp', 2) }" data-p>
                    <div class="flex min-w-0 flex-col gap-0.5">
                      <b class="font-semibold">Feature store без боли</b>
                      <span class="text-xs text-[#6a6a6a]">Data Fest, Казань · 14 ноября</span>
                    </div>
                    <span class="tag tag-dash">Карточка готова</span>
                  </div>
                  <div class="peek-row" :class="{ on: shown('sp', 3) }" data-p>
                    <span
                      ><b class="font-semibold">Команда DevRel</b>
                      <span class="text-sm text-[#6a6a6a]">· увидела</span></span
                    >
                    <span class="tag fill-ink text-l-mint">Засчитано</span>
                  </div>
                </template>
                <template v-else>
                  <div class="flex flex-wrap gap-1.5 px-0.5">
                    <span class="chip" :class="{ on: shown('co', 1) }">Data Science</span>
                    <span class="chip" :class="{ on: shown('co', 1) }">NPS от 9.4</span>
                    <span class="chip">Не Москва</span>
                  </div>
                  <div
                    v-for="(row, i) in people"
                    :key="row.name"
                    class="peek-row"
                    :class="{ on: shown('co', i + 2) }"
                    data-p
                  >
                    <div class="flex min-w-0 flex-col gap-0.5">
                      <b class="font-semibold">{{ row.name }}</b>
                      <span class="text-xs text-[#6a6a6a]">{{ row.text }}</span>
                    </div>
                    <span class="flex flex-none items-center gap-2.5">
                      <span class="font-mono font-bold">{{ row.nps }}</span>
                      <span class="tag" :class="row.tag">{{ row.status }}</span>
                    </span>
                  </div>
                </template>
              </div>
              <span class="flex items-center justify-between gap-3 self-stretch">
                <span class="kicker">{{ half.kicker }}</span>
                <span class="b b-ink b-sm">Смотреть<ArrowRight /></span>
              </span>
              <span
                class="shout text-[clamp(44px,4.4vw,64px)] whitespace-nowrap max-sm:text-[40px] max-sm:whitespace-normal"
                >{{
                  half.title
                }}</span
              >
              <span class="max-w-110 text-[15px] leading-normal text-ink-2 max-sm:hidden">{{ half.text }}</span>
            </router-link>
          </nav>
        </div>
      </section>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import SpPage from '@/components/speaker/SpPage.vue'
import { useFx } from '@/composables/useFx'

type Side = 'sp' | 'co'

const CYCLE_MS = 4200
const TYPING_MS = 45
const LINK = 'datafest.ru/program'

const halves = [
  {
    side: 'sp',
    to: '/speakers',
    surface: 'surface-mint',
    kicker: '01 · Спикерам',
    title: 'Я выступаю',
    text: 'Портфолио выступлений, подборка площадок и честный разбор доклада.',
    peekTitle: 'Новое выступление',
    peekNote: 'Портфолио',
  },
  {
    side: 'co',
    to: '/companies',
    surface: 'surface-lime',
    kicker: '02 · Компаниям',
    title: 'Я из компании',
    text: 'Все спикеры компании, их выступления и оценки зала — в одном окне.',
    peekTitle: 'Спикеры',
    peekNote: '212 · 14 городов',
  },
] as const
const people = [
  {
    name: 'Анна Ковалёва',
    text: 'Data Science · Казань · 6 выступлений',
    nps: '9.7',
    status: 'Рекомендую',
    tag: 'fill-ink text-l-mint',
  },
  { name: 'Ольга Смирнова', text: 'Data Science · Екатеринбург', nps: '9.6', status: 'Приглашена', tag: 'tag-dash' },
]

const root = useTemplateRef<HTMLElement>('root')
const flip = useTemplateRef<HTMLElement>('flip')
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
const side = ref<Side>('sp')
const letter = ref('х')
const scene = reactive({ typed: '', step: 0 })
let hold = false
let cycleTimer = 0
const sceneTimers: number[] = []

// Мини-сцена активной половины: ссылка печатается, строки появляются по шагам
const shown = (of: Side, n: number) => side.value === of && scene.step >= n

const play = () => {
  for (const id of sceneTimers.splice(0)) clearTimeout(id)
  scene.typed = ''
  scene.step = 0
  if (calm) {
    scene.typed = LINK
    scene.step = 3
    return
  }
  const at = (fn: () => void, ms: number) => sceneTimers.push(window.setTimeout(fn, ms))
  let t = 250
  if (side.value === 'sp') {
    for (let i = 0; i < LINK.length; i++) at(() => (scene.typed = LINK.slice(0, i + 1)), t + i * TYPING_MS)
    t += LINK.length * TYPING_MS + 200
  } else at(() => (scene.step = 1), t)
  at(() => (scene.step = 2), t + 650)
  at(() => (scene.step = 3), t + 1450)
}

const cycle = () => {
  clearTimeout(cycleTimer)
  if (hold || calm) return
  cycleTimer = window.setTimeout(() => {
    side.value = side.value === 'sp' ? 'co' : 'sp'
    cycle()
  }, CYCLE_MS)
}
const hover = (next: Side) => {
  hold = true
  clearTimeout(cycleTimer)
  side.value = next
}
const release = () => {
  hold = false
  cycle()
}

const nextLetter = computed(() => (side.value === 'sp' ? 'х' : 'в'))
watch(side, () => {
  play()
  if (calm) {
    letter.value = nextLetter.value
    return
  }
  flip.value?.animate(
    [
      { transform: 'perspective(400px) rotateX(0)' },
      { transform: 'perspective(400px) rotateX(90deg)', offset: 0.48 },
      { transform: 'perspective(400px) rotateX(-90deg)', offset: 0.52 },
      { transform: 'perspective(400px) rotateX(0)' },
    ],
    { duration: 520, easing: 'cubic-bezier(.5,0,.2,1)' },
  )
  sceneTimers.push(window.setTimeout(() => (letter.value = nextLetter.value), 250))
})

onMounted(() => {
  play()
  cycle()
})
onBeforeUnmount(() => {
  clearTimeout(cycleTimer)
  for (const id of sceneTimers) clearTimeout(id)
})

useFx(root, { words: 'home' })
</script>
