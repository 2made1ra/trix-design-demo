<template>
  <sp-page>
    <div ref="root" class="flex flex-1 flex-col">
      <app-header />

      <main class="wrap pt-10 pb-40">
        <section v-if="state.status === 'loading'" class="mx-auto mt-14 max-w-220" role="status" aria-busy="true">
          <span class="sr-only">Загружаем разбор</span>
          <div class="tile skel" aria-hidden="true"><i class="s" /><i class="t" /><i class="m" /><i class="s" /></div>
        </section>

        <section
          v-else-if="state.status === 'missing' || state.status === 'error'"
          class="tile mt-14 flex max-w-160 flex-col gap-5"
          :role="state.status === 'error' ? 'alert' : undefined"
        >
          <h1 class="text-[34px] leading-none font-bold">
            {{ state.status === 'error' ? 'Не удалось загрузить разбор' : 'Такого разбора нет' }}
          </h1>
          <p class="text-[17px] leading-[1.55] text-ink-2">
            {{
              state.status === 'error'
                ? 'Проверьте соединение и попробуйте ещё раз.'
                : 'Разбор виден только тому, кто его запросил. Возможно, ссылка устарела.'
            }}
          </p>
          <div class="flex flex-wrap gap-3">
            <button v-if="state.status === 'error'" type="button" class="b b-ink b-sm" @click="start">
              Повторить<RotateCw />
            </button>
            <router-link to="/events" class="b b-line b-sm">К мероприятиям</router-link>
          </div>
        </section>

        <template v-else>
          <nav aria-label="Путь по разделу" class="kicker flex flex-wrap gap-2.5 text-ink-2">
            <router-link to="/events" class="hover:text-ink">Мероприятия</router-link>
            <span aria-hidden="true">/</span>
            <router-link :to="`/c/${state.review.event.slug}`" class="hover:text-ink">{{
              state.review.event.name
            }}</router-link>
            <span aria-hidden="true">/</span>
            <router-link v-if="state.review.status !== 'done'" :to="uploadPath" class="hover:text-ink"
              >Подготовить доклад</router-link
            >
            <span class="text-ink" aria-current="page">{{
              state.review.status === 'done' ? 'Разбор до выступления' : 'Разбор'
            }}</span>
          </nav>

          <!-- Ожидание и ошибка -->
          <div v-if="state.review.status !== 'done'" class="mx-auto mt-14 flex max-w-220 flex-col gap-10">
            <div class="flex flex-col gap-5" data-rv>
              <span class="ribbon self-start">Разбор до выступления</span>
              <h1 class="shout text-d2">{{ state.review.title }}</h1>
              <div class="flex flex-wrap gap-2">
                <span class="tag">{{ state.review.event.name }}</span>
                <span v-for="material in state.review.materials" :key="material" class="tag">{{ material }}</span>
              </div>
            </div>

            <section class="tile tile-slate px-10 pt-10 pb-8" aria-labelledby="steps-title" data-rv>
              <h2 id="steps-title" class="sr-only">Ход разбора</h2>
              <div class="sr-only" role="progressbar" aria-label="Разбор доклада" :aria-valuetext="progress" />
              <ol class="stream steps m-0 list-none p-0">
                <li v-for="(step, i) in steps" :key="step.title" class="stream-item" :data-step="stepState(i)">
                  <div class="kicker pt-3.5 text-ink-2 md:text-right">
                    <b
                      class="block font-sans text-[clamp(28px,2.4vw,34px)] leading-none font-bold tracking-[-0.03em] text-ink"
                      >{{
                        String(i + 1).padStart(2, '0')
                      }}</b
                    >
                  </div>
                  <div
                    class="flex flex-col gap-2.5 pt-2.5 pb-8 last:pb-2"
                    :class="{ 'text-ink-2': stepState(i) === 'wait' }"
                  >
                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <h3 class="text-2xl leading-[1.05] font-bold">{{ step.title }}</h3>
                      <span class="tag" :class="badge(i).class">
                        <i v-if="stepState(i) === 'run'" class="dot-live" />{{ badge(i).label }}
                      </span>
                    </div>
                    <p class="text-sm text-ink-2">{{ step.text }}</p>
                    <span v-if="stepState(i) === 'run'" class="run-bar" aria-hidden="true" />
                  </div>
                </li>
              </ol>

              <div
                class="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pt-6 shadow-[inset_0_1px_0_var(--line-2)]"
              >
                <p class="m-0 text-xl leading-[1.1] font-bold" aria-live="polite">
                  {{ state.review.status === 'failed' ? 'Разбор остановлен на первом шаге' : statusLine }}
                </p>
              </div>
            </section>

            <div
              v-if="state.review.status === 'failed'"
              class="flex flex-col gap-4 rounded-3xl bg-[color-mix(in_srgb,var(--pink)_28%,var(--bg))] px-8 py-7"
              role="alert"
            >
              <template v-if="state.review.error?.key === 'text_not_extracted'">
                <h2 class="text-2xl leading-[1.05] font-bold">Не удалось извлечь текст из {{ fileName }}</h2>
                <p>Мы не нашли в файле текста, который можно прочитать. Так бывает, если:</p>
                <ul class="m-0 flex list-disc flex-col gap-1.5 pl-5 text-sm">
                  <li>PDF собран из картинок или сканов слайдов;</li>
                  <li>файл защищён паролем или запретом на копирование.</li>
                </ul>
                <p class="text-sm text-ink-2">
                  Сохраните презентацию через «Экспорт в PDF» без защиты и загрузите снова. Или вставьте текст
                  выступления вручную: разбор по тексту тоже работает.
                </p>
              </template>
              <template v-else>
                <h2 class="text-2xl leading-[1.05] font-bold">Не удалось сделать разбор</h2>
                <p>{{ state.review.error?.message ?? 'Что-то пошло не так на нашей стороне.' }}</p>
              </template>
              <div class="mt-1 flex flex-wrap gap-3">
                <router-link :to="uploadPath" class="b b-ink">Загрузить заново<Upload /></router-link>
                <router-link v-if="state.review.error?.key === 'text_not_extracted'" :to="uploadPath" class="b b-line">
                  Вставить текст вручную
                </router-link>
              </div>
            </div>

            <div class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3" data-rv>
              <p v-if="state.review.status === 'processing'" class="max-w-140 text-sm text-ink-2">
                Обычно это занимает меньше минуты. Страницу можно не закрывать — разбор откроется сам.
              </p>
              <span v-else />
              <span class="kicker flex items-center gap-2 text-ink-2"
                ><Lock class="size-3.5" />Разбор видите только вы</span
              >
            </div>
          </div>

          <!-- Готовый разбор -->
          <template v-else-if="state.review.result">
            <div class="mt-12 flex flex-col gap-6" data-rv>
              <div class="flex flex-wrap items-center gap-4">
                <span class="ribbon">Разбор до выступления</span>
                <span class="kicker flex items-center gap-1.5 text-ink-2"
                  ><Lock class="size-3.5" />Видите только вы</span
                >
              </div>
              <h1 class="shout max-w-300 text-d1">{{ state.review.title }}</h1>
              <div class="flex flex-wrap items-center justify-between gap-6">
                <p class="max-w-190 text-[17px] leading-[1.55] text-ink-2">
                  Для мероприятия:
                  <router-link :to="`/c/${state.review.event.slug}`" class="ln text-ink">{{
                    state.review.event.name
                  }}</router-link
                  >. Материалы: {{ state.review.materials.join(' и ') }}
                </p>
                <div class="flex flex-wrap gap-3">
                  <router-link :to="uploadPath" class="b b-mint"><Upload />Загрузить новую версию</router-link>
                  <router-link to="/events" class="b b-line">Вернуться к подборке<ArrowRight /></router-link>
                </div>
              </div>
            </div>

            <div class="mt-14 flex flex-wrap gap-4">
              <section
                class="tile surface-yellow flex min-w-0 flex-[999_1_520px] flex-col justify-between gap-10 p-12"
                aria-labelledby="main-title"
                data-rv
              >
                <span id="main-title" class="kicker">01 / Главное</span>
                <p class="font-serif text-[clamp(28px,2.9vw,42px)] leading-[1.16]">
                  {{ summary.lead }} <span class="text-ink-2">{{ summary.rest }}</span>
                </p>
              </section>

              <section
                class="tile surface-ink flex min-w-0 flex-[1_1_380px] flex-col gap-4"
                aria-labelledby="criteria-title"
                data-rv
              >
                <div class="flex items-center justify-between">
                  <span class="tag fill-mint">AI · Оценка</span>
                  <span class="kicker text-ink-2">{{
                    state.review.materials.length > 1 ? 'Текст + слайды' : 'По материалам'
                  }}</span>
                </div>
                <h2 id="criteria-title" class="text-2xl leading-[1.05] font-bold">Оценка по критериям</h2>
                <div class="flex items-center gap-3.5">
                  <div class="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
                    <i
                      v-for="criterion in state.review.result.criteria"
                      :key="criterion.id"
                      class="h-2.5 rounded-xs"
                      :class="criteriaMarks[criterion.state].meter"
                    />
                  </div>
                  <span class="font-mono text-[13px] font-bold"
                    >{{ okCount }}
                    из {{ state.review.result.criteria.length }} в порядке</span
                  >
                </div>
                <div>
                  <div
                    v-for="criterion in state.review.result.criteria"
                    :key="criterion.id"
                    class="flex items-center justify-between gap-4 py-3.5 text-[15px] shadow-[inset_0_1px_0_var(--line-2)]"
                  >
                    <span>{{ criterion.name }}</span>
                    <span class="tag" :class="criteriaMarks[criterion.state].tag">{{
                      criteriaMarks[criterion.state].label
                    }}</span>
                  </div>
                </div>
                <p class="text-sm text-ink-2">
                  Оценка по материалам с учётом аудитории мероприятия: уровень, кто приходит, треки, длительность слота.
                </p>
              </section>
            </div>

            <section class="mt-28" aria-labelledby="fix-title">
              <div class="mb-10 flex flex-wrap items-end justify-between gap-6" data-rv>
                <h2 id="fix-title" class="shout text-d2">02 / Правки по приоритету</h2>
                <p class="text-[17px] leading-[1.55] text-ink-2">Сверху — то, что сильнее всего влияет на оценку.</p>
              </div>
              <ol class="stream m-0 list-none p-0 [--tc:120px]">
                <li v-for="(fix, i) in state.review.result.fixes" :key="fix.id" class="stream-item">
                  <sp-stream-label label="Правка" :number="String(i + 1).padStart(2, '0')" />
                  <div class="tile grid grid-cols-[minmax(0,1fr)_auto] items-start gap-8 max-sm:grid-cols-1" data-rv>
                    <div class="flex flex-col gap-2.5">
                      <span class="tag self-start" :class="fix.priority === 'high' && 'fill-ink text-l-mint'">{{
                        fix.priority === 'high' ? 'Высокий' : 'Средний'
                      }}</span>
                      <h3 class="text-2xl leading-[1.05] font-bold">{{ fix.title }}</h3>
                      <p class="text-ink-2">{{ fix.text }}</p>
                    </div>
                    <span class="kicker flex items-center gap-2 whitespace-nowrap">
                      <Presentation v-if="fix.where.startsWith('Слайд')" class="size-4" aria-hidden="true" />
                      <FileText v-else class="size-4" aria-hidden="true" />{{ fix.where }}
                    </span>
                  </div>
                </li>
              </ol>
            </section>

            <section class="mt-28" aria-labelledby="qa-title">
              <div class="mb-8 flex flex-wrap items-end justify-between gap-6" data-rv>
                <h2 id="qa-title" class="shout text-d2">03 / Вопросы из зала</h2>
                <p class="text-[17px] leading-[1.55] text-ink-2">
                  Вероятные вопросы этой аудитории и как на них ответить.
                </p>
              </div>
              <div class="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-4">
                <article
                  v-for="(item, i) in state.review.result.questions"
                  :key="item.id"
                  class="tile flex flex-col gap-4.5"
                  data-rv
                >
                  <span class="kicker text-ink-2">Вопрос {{ String(i + 1).padStart(2, '0') }}</span>
                  <h3 class="text-2xl leading-[1.05] font-bold">{{ item.question }}</h3>
                  <p class="why"><b>Как ответить</b>{{ lowerFirst(item.answer) }}</p>
                </article>
              </div>
            </section>
          </template>
        </template>
      </main>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRight, FileText, Lock, Presentation, RotateCw, Upload } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { type CriterionState, getTalkReview, type TalkReview, type TalkReviewStage } from '@/api/demo'
import AppHeader from '@/components/AppHeader.vue'
import SpPage from '@/components/speaker/SpPage.vue'
import SpStreamLabel from '@/components/speaker/SpStreamLabel.vue'
import { useFx } from '@/composables/useFx'

type State =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error' }
  | { status: 'ready'; review: TalkReview }
type StepState = 'done' | 'run' | 'wait' | 'fail'

const POLL_MS = 1500

const route = useRoute()
const root = useTemplateRef<HTMLElement>('root')
const id = String(route.params.id)
const state = shallowRef<State>({ status: 'loading' })
let timer = 0

const steps = [
  { title: 'Читаем материалы', text: 'Текст выступления и слайды из файла.' },
  { title: 'Сверяем с аудиторией', text: 'Уровень, кто приходит, треки и длительность слота мероприятия.' },
  { title: 'Готовим правки', text: 'Оценка по четырём критериям, правки по приоритету, вопросы из зала.' },
]
const stages: TalkReviewStage[] = ['reading', 'matching', 'scoring']
const statusLines = ['Читаем материалы', 'Сверяем доклад с аудиторией мероприятия', 'Готовим правки и вопросы из зала']

const criteriaMarks: Record<CriterionState, { label: string; tag: string; meter: string }> = {
  ok: { label: 'В порядке', tag: 'fill-mint', meter: 'bg-mint' },
  improve: { label: 'Доработать', tag: 'fill-yellow', meter: 'bg-yellow' },
  weak: { label: 'Слабо', tag: 'fill-pink', meter: 'bg-pink' },
}

const review = computed(() => (state.value.status === 'ready' ? state.value.review : null))
const uploadPath = computed(() => ({ name: 'talks.new', query: { event: review.value?.event.slug } }))
const current = computed(() => stages.indexOf(review.value?.stage ?? 'reading'))
const statusLine = computed(() => statusLines[current.value] ?? '')
const progress = computed(() =>
  review.value?.status === 'failed'
    ? 'Остановлен на шаге 1: не удалось извлечь текст'
    : `Шаг ${current.value + 1} из 3: ${statusLines[current.value]?.toLowerCase()}`,
)
const fileName = computed(() => review.value?.materials.find((item) => /\.\w{2,4}$/.test(item)) ?? 'файла')
const okCount = computed(() => review.value?.result?.criteria.filter((c) => c.state === 'ok').length ?? 0)
const summary = computed(() => {
  const text = review.value?.result?.summary ?? ''
  const end = text.indexOf('. ')
  return end < 0 ? { lead: text, rest: '' } : { lead: text.slice(0, end + 1), rest: text.slice(end + 2) }
})

const stepState = (i: number): StepState => {
  if (review.value?.status === 'failed') return i === 0 ? 'fail' : 'wait'
  return i < current.value ? 'done' : i === current.value ? 'run' : 'wait'
}
const badge = (i: number) => {
  const failed = review.value?.status === 'failed'
  switch (stepState(i)) {
    case 'done':
      return { label: 'Готово', class: 'fill-mint' }
    case 'run':
      return { label: 'В работе', class: '' }
    case 'fail':
      return { label: 'Ошибка', class: 'fill-pink' }
    default:
      return { label: failed ? 'Не начат' : 'Ждёт', class: 'tag-dash' }
  }
}
const lowerFirst = (text: string) =>
  text[1] && text[1] === text[1].toLowerCase() ? text[0]?.toLowerCase() + text.slice(1) : text

const poll = async () => {
  const res = await getTalkReview(id)
  if (res.status === 404) {
    state.value = { status: 'missing' }
    return
  }
  if (res.status !== 200) {
    state.value = { status: 'error' }
    return
  }
  state.value = { status: 'ready', review: res.data }
  if (res.data.status === 'processing') timer = window.setTimeout(poll, POLL_MS)
}
const start = () => {
  clearTimeout(timer)
  state.value = { status: 'loading' }
  return poll()
}

onMounted(start)
onBeforeUnmount(() => clearTimeout(timer))
useFx(root, { words: 'review', rail: true })
</script>
