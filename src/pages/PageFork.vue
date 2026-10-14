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
                <transition-group tag="div" class="feed" :css="false" @enter="slideIn">
                  <div v-for="item in feeds[half.side]" :key="item.key" class="row">
                    <div class="cell">
                      <b>{{ item.title }}</b>
                      <span>{{ item.text }}</span>
                    </div>
                    <span v-if="item.nps" class="end">
                      <span class="num">{{ item.nps }}</span>
                      <app-tag :tone="item.tone">{{ item.tag }}</app-tag>
                    </span>
                    <app-tag v-else :tone="item.tone">{{ item.tag }}</app-tag>
                  </div>
                </transition-group>
              </div>
              <span class="half-row">
                <span class="k">{{ half.kicker }}</span>
                <app-button as="span" variant="ink" sm>Смотреть<ArrowRight /></app-button>
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
import AppButton from '@/components/AppButton.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppTag from '@/components/AppTag.vue'
import AppTile from '@/components/AppTile.vue'
import SpPage from '@/components/speaker/SpPage.vue'
import type { TagTone } from '@/components/tones'
import { useFx } from '@/composables/useFx'

type Side = 'sp' | 'co'
type FeedItem = { title: string; text: string; tag: string; tone: TagTone; nps?: string }

const CYCLE_MS = 4200
const FEED_MS = 1800
const FEED_MAX = 14
const ROW_GAP = 8

const halves = [
  {
    side: 'sp',
    to: '/speakers',
    tone: 'mint',
    kicker: '01 · Спикерам',
    title: 'Я выступаю',
    text: 'Портфолио выступлений, подборка площадок и честный разбор доклада.',
    peekTitle: 'Для вас сейчас',
    peekNote: '128 площадок ищут спикеров',
  },
  {
    side: 'co',
    to: '/companies',
    tone: 'lime',
    kicker: '02 · Компаниям',
    title: 'Я из компании',
    text: 'Все спикеры компании, их выступления и оценки зала — в одном окне.',
    peekTitle: 'Выступления ваших спикеров',
    peekNote: '212 · 14 городов',
  },
] as const

// Площадки и спикеры вымышленные: реальные названия на развилке читались бы как партнёрства
const FEED: Record<Side, FeedItem[]> = {
  sp: [
    { title: 'МЛ-Конф', text: 'Трек «ML в проде» · Москва · 12 декабря', tag: 'Под вашу тему', tone: 'ink' },
    { title: 'ДатаКон', text: 'Трек «Хранилища» · Казань · 14 ноября', tag: 'Заявки до 1 ноября', tone: 'dash' },
    { title: 'Облакс зовёт на митап', text: 'Платформа данных · Москва · 21 ноября', tag: 'Лично вам', tone: 'yellow' },
    { title: 'Инфра-Саммит', text: 'Трек «Платформы данных» · Санкт-Петербург', tag: 'Оплачивается', tone: 'dash' },
    { title: 'Код-Сибирь', text: 'Трек «Data Science» · Новосибирск · 20 марта', tag: 'Под вашу тему', tone: 'ink' },
    { title: 'Бэкенд-Фест', text: 'Трек «Хранение» · Екатеринбург · 3 апреля', tag: 'Оплачивается', tone: 'dash' },
    { title: 'Лаборатория «Вектор»', text: 'Митап по NLP · онлайн · 9 декабря', tag: 'Лично вам', tone: 'yellow' },
    {
      title: 'Питон-Север',
      text: 'Трек «Данные» · Петрозаводск · 15 февраля',
      tag: 'Заявки до 15 января',
      tone: 'dash',
    },
    { title: 'ПродуктКэмп', text: 'Трек «Аналитика» · Сочи · 18 мая', tag: 'Под вашу тему', tone: 'ink' },
    { title: 'Сетка', text: 'Трек «Рекомендации» · Нижний Новгород', tag: 'Оплачивается', tone: 'dash' },
  ],
  co: [
    { title: 'Анна Ковалёва', text: 'ДатаКон · Казань', nps: '9.7', tag: 'Подтвердить', tone: 'yellow' },
    { title: 'Павел Морозов', text: 'Код-Сибирь · Новосибирск', nps: '9.5', tag: 'Засчитано', tone: 'dash' },
    { title: 'Мария Орлова', text: 'Инфра-Саммит · Санкт-Петербург', nps: '9.6', tag: 'Засчитано', tone: 'dash' },
    { title: 'Игорь Лебедев', text: 'Бэкенд-Фест · Екатеринбург', nps: '9.4', tag: 'Подтвердить', tone: 'yellow' },
    { title: 'Ольга Смирнова', text: 'МЛ-Конф · Москва', nps: '9.8', tag: 'Засчитано', tone: 'dash' },
    { title: 'Дмитрий Ким', text: 'Сетка · Нижний Новгород', nps: '9.5', tag: 'Засчитано', tone: 'dash' },
    { title: 'Елена Соколова', text: 'ПродуктКэмп · Сочи', nps: '9.6', tag: 'Подтвердить', tone: 'yellow' },
    { title: 'Артём Белов', text: 'Питон-Север · Петрозаводск', nps: '9.4', tag: 'Засчитано', tone: 'dash' },
    { title: 'Ксения Павлова', text: 'Облакс, митап · Москва', nps: '9.7', tag: 'Засчитано', tone: 'dash' },
    { title: 'Руслан Ахметов', text: 'Код-Сибирь · Новосибирск', nps: '9.5', tag: 'Подтвердить', tone: 'yellow' },
  ],
}

const root = useTemplateRef<HTMLElement>('root')
const flip = useTemplateRef<HTMLElement>('flip')
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
const side = ref<Side>('sp')
const letter = ref('х')
let hold = false
let cycleTimer = 0
let feedTimer = 0
const flipTimers: number[] = []

// Лента заполнена заранее от новых к старым, поэтому следующая строка продолжает очередь без повторов рядом
let key = 0
const entry = (of: Side, n: number) => ({ ...FEED[of][n % FEED[of].length], key: key++ })
const prefill = (of: Side) => FEED[of].map((_, i) => entry(of, FEED[of].length - 1 - i))
const feeds = reactive({ sp: prefill('sp'), co: prefill('co') })
const next = { sp: FEED.sp.length, co: FEED.co.length }

const push = (of: Side) => {
  feeds[of].unshift(entry(of, next[of]++))
  feeds[of].splice(FEED_MAX)
}

// Новая строка выезжает из-под верхнего края ленты и сдвигает остальные вниз
const slideIn = (el: Element, done: () => void) => {
  const shift = (el as HTMLElement).offsetHeight + ROW_GAP
  el.animate(
    [
      { marginTop: `-${shift}px`, opacity: 0 },
      { marginTop: '0px', opacity: 1 },
    ],
    {
      duration: 700,
      easing: 'cubic-bezier(.2,.7,.2,1)',
    },
  ).finished.then(done, done)
}

// Лента течёт только у активной половины
const stream = () => {
  clearTimeout(feedTimer)
  if (calm) return
  feedTimer = window.setTimeout(() => {
    push(side.value)
    stream()
  }, FEED_MS)
}

const cycle = () => {
  clearTimeout(cycleTimer)
  if (hold || calm) return
  cycleTimer = window.setTimeout(() => {
    side.value = side.value === 'sp' ? 'co' : 'sp'
    cycle()
  }, CYCLE_MS)
}
const hover = (to: Side) => {
  hold = true
  clearTimeout(cycleTimer)
  side.value = to
}
const release = () => {
  hold = false
  cycle()
}

const nextLetter = computed(() => (side.value === 'sp' ? 'х' : 'в'))
watch(side, () => {
  stream()
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
  flipTimers.push(window.setTimeout(() => (letter.value = nextLetter.value), 250))
})

onMounted(() => {
  stream()
  cycle()
})
onBeforeUnmount(() => {
  clearTimeout(cycleTimer)
  clearTimeout(feedTimer)
  for (const id of flipTimers) clearTimeout(id)
})

useFx(root, { words: 'home' })
</script>
