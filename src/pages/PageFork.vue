<template>
  <sp-page :calm="false" footer="fork" class="fork" :data-on="side">
    <div ref="root" class="contents">
      <div class="beta k"><span>TRIX в закрытой бете: для спикеров и компаний</span></div>

      <section class="fork-hero">
        <app-header variant="fork" />

        <div class="wrap fork-body">
          <h1
            class="fork-h d-1"
            aria-label="TRIX — для тех, кто выходит на сцену, и для тех, кто выводит на сцену"
            data-rv
          >
            <span class="hb">TRIX<b /></span>&nbsp;для тех, кто
            <em aria-hidden="true">вы<span ref="flip" class="flip">{{ letter }}</span>одит на сцену.</em>
          </h1>

          <nav class="fork-split" aria-label="Для кого TRIX">
            <app-tile
              v-for="half in halves"
              :key="half.side"
              class="half"
              :to="half.to"
              :class="[half.side, half.tone]"
              data-rv
              @mouseenter="hover(half.side)"
              @focus="hover(half.side)"
              @mouseleave="release"
              @blur="release"
            >
              <div class="peek" aria-hidden="true">
                <div class="peek-top">
                  <span class="k">{{ half.peekTitle }}</span>
                  <span class="k muted">{{ half.peekNote }}</span>
                </div>
                <template v-if="half.side === 'sp'">
                  <div class="row">
                    <span class="small">Ссылка</span>
                    <b class="ty" :class="{ typing }">{{ scene.typed }}</b>
                  </div>
                  <div class="row" data-p :class="{ on: shown('sp', 2) }">
                    <div class="cell">
                      <b>Feature store без боли</b>
                      <span>Data Fest, Казань · 14 ноября</span>
                    </div>
                    <app-tag tone="dash">Карточка готова</app-tag>
                  </div>
                  <div class="row" data-p :class="{ on: shown('sp', 3) }">
                    <span><b>Команда DevRel</b> <span class="small muted">· увидела</span></span>
                    <app-tag tone="ink">Засчитано</app-tag>
                  </div>
                </template>
                <template v-else>
                  <div class="chips">
                    <span class="chip" :class="{ on: shown('co', 1) }">Data Science</span>
                    <span class="chip" :class="{ on: shown('co', 1) }">NPS от 9.4</span>
                    <span class="chip">Не Москва</span>
                  </div>
                  <div
                    v-for="(row, i) in people"
                    :key="row.name"
                    class="row"
                    data-p
                    :class="{ on: shown('co', i + 2) }"
                  >
                    <div class="cell">
                      <b>{{ row.name }}</b>
                      <span>{{ row.text }}</span>
                    </div>
                    <span class="end">
                      <span class="num">{{ row.nps }}</span>
                      <app-tag :tone="row.tag">{{ row.status }}</app-tag>
                    </span>
                  </div>
                </template>
              </div>
              <span class="half-row">
                <span class="k">{{ half.kicker }}</span>
                <span class="b b-ink b-sm">Смотреть<ArrowRight /></span>
              </span>
              <span class="half-t shout">{{ half.title }}</span>
              <span class="half-d">{{ half.text }}</span>
            </app-tile>
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
import AppTag from '@/components/AppTag.vue'
import AppTile from '@/components/AppTile.vue'
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
    tone: 'mint',
    kicker: '01 · Спикерам',
    title: 'Я выступаю',
    text: 'Портфолио выступлений, подборка площадок и честный разбор доклада.',
    peekTitle: 'Новое выступление',
    peekNote: 'Портфолио',
  },
  {
    side: 'co',
    to: '/companies',
    tone: 'lime',
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
    tag: 'ink',
  },
  { name: 'Ольга Смирнова', text: 'Data Science · Екатеринбург', nps: '9.6', status: 'Приглашена', tag: 'dash' },
] as const

const root = useTemplateRef<HTMLElement>('root')
const flip = useTemplateRef<HTMLElement>('flip')
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
const side = ref<Side>('sp')
const letter = ref('х')
const scene = reactive({ typed: '', step: 0 })
let hold = false
let cycleTimer = 0
const sceneTimers: number[] = []
const typing = computed(() => !calm && side.value === 'sp' && scene.typed.length < LINK.length)

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
