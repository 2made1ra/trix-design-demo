<template>
  <sp-page>
    <div ref="root" class="flex flex-1 flex-col">
      <app-header :current="review?.status === 'done' ? 'talks' : 'events'" />

      <main class="wrap pt-10 pb-40">
        <section v-if="state.status === 'loading'" class="mx-auto mt-14 max-w-220" role="status" aria-busy="true">
          <span class="sr">Загружаем разбор</span>
          <div class="tile skel" aria-hidden="true"><i class="s" /><i class="t" /><i class="m" /><i class="s" /></div>
        </section>

        <section
          v-else-if="state.status === 'missing' || state.status === 'error'"
          class="tile sel-st mt-14 max-w-160"
          :role="state.status === 'error' ? 'alert' : undefined"
        >
          <h1 class="h-34">
            {{ state.status === 'error' ? 'Не удалось загрузить разбор' : 'Такого разбора нет' }}
          </h1>
          <p class="deck">
            {{
              state.status === 'error'
                ? 'Проверьте соединение и попробуйте ещё раз.'
                : 'Разбор виден только тому, кто его запросил. Возможно, ссылка устарела.'
            }}
          </p>
          <div class="sel-acts">
            <button v-if="state.status === 'error'" type="button" class="b b-ink b-sm" @click="start">
              Повторить<RotateCw />
            </button>
            <router-link to="/events" class="b b-line b-sm">К мероприятиям</router-link>
          </div>
        </section>

        <template v-else>
          <nav aria-label="Путь по разделу" class="crumbs k">
            <router-link to="/events">Мероприятия</router-link>
            <span aria-hidden="true">/</span>
            <router-link :to="`/c/${state.review.event.slug}`">{{ state.review.event.name }}</router-link>
            <span aria-hidden="true">/</span>
            <router-link v-if="state.review.status !== 'done'" :to="uploadPath">Подготовить доклад</router-link>
            <span aria-current="page">{{ state.review.status === 'done' ? 'Разбор до выступления' : 'Разбор' }}</span>
          </nav>

          <!-- Ожидание и ошибка -->
          <div v-if="state.review.status !== 'done'" class="center mt-14">
            <div class="flex flex-col gap-5" data-rv>
              <span class="ribbon self-start">Разбор до выступления</span>
              <h1 class="d-2">{{ state.review.title }}</h1>
              <div class="flex flex-wrap gap-2">
                <span class="tag">{{ state.review.event.name }}</span>
                <span v-for="material in state.review.materials" :key="material" class="tag">{{ material }}</span>
              </div>
            </div>

            <section class="tile slate stepbox" aria-labelledby="steps-title" data-rv>
              <h2 id="steps-title" class="sr">Ход разбора</h2>
              <div class="sr" role="progressbar" aria-label="Разбор доклада" :aria-valuetext="progress" />
              <ol class="stream steps">
                <li v-for="(step, i) in steps" :key="step.title" class="st stream-item" :data-step="stepState(i)">
                  <div class="st-time k">
                    <b>{{ String(i + 1).padStart(2, '0') }}</b>
                  </div>
                  <div class="step" :class="{ 'text-ink-2': stepState(i) === 'wait' }">
                    <div class="step-h">
                      <h3 class="h-24">{{ step.title }}</h3>
                      <span class="tag" :class="badge(i).class">
                        <i v-if="stepState(i) === 'run'" class="dot-live" />{{ badge(i).label }}
                      </span>
                    </div>
                    <p class="small muted">{{ step.text }}</p>
                    <span v-if="stepState(i) === 'run'" class="run-bar" aria-hidden="true" />
                  </div>
                </li>
              </ol>

              <div class="status">
                <p class="h-20 m-0" aria-live="polite">
                  {{ state.review.status === 'failed' ? 'Разбор остановлен на первом шаге' : statusLine }}
                </p>
              </div>
            </section>

            <div v-if="state.review.status === 'failed'" class="fail" role="alert">
              <template v-if="state.review.error?.key === 'text_not_extracted'">
                <h2 class="h-24">Не удалось извлечь текст из {{ fileName }}</h2>
                <p>Мы не нашли в файле текста, который можно прочитать. Так бывает, если:</p>
                <ul class="small">
                  <li>PDF собран из картинок или сканов слайдов;</li>
                  <li>файл защищён паролем или запретом на копирование.</li>
                </ul>
                <p class="small muted">
                  Сохраните презентацию через «Экспорт в PDF» без защиты и загрузите снова. Или вставьте текст
                  выступления вручную: разбор по тексту тоже работает.
                </p>
              </template>
              <template v-else>
                <h2 class="h-24">Не удалось сделать разбор</h2>
                <p>{{ state.review.error?.message ?? 'Что-то пошло не так на нашей стороне.' }}</p>
              </template>
              <div class="sel-acts mt-1">
                <router-link :to="uploadPath" class="b b-ink">Загрузить заново<Upload /></router-link>
                <router-link v-if="state.review.error?.key === 'text_not_extracted'" :to="uploadPath" class="b b-line">
                  Вставить текст вручную
                </router-link>
              </div>
            </div>

            <div class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3" data-rv>
              <p v-if="state.review.status === 'processing'" class="small muted max-w-140">
                Обычно это занимает меньше минуты. Страницу можно не закрывать — разбор откроется сам.
              </p>
              <span v-else />
              <span class="k muted lock"><Lock />Разбор видите только вы</span>
            </div>
          </div>

          <!-- Готовый разбор -->
          <template v-else-if="state.review.result">
            <div class="mt-12 flex flex-col gap-6" data-rv>
              <div class="flex flex-wrap items-center gap-4">
                <span class="ribbon">Разбор до выступления</span>
                <span class="k muted lock"><Lock />Видите только вы</span>
              </div>
              <h1 class="d-1 max-w-300">{{ state.review.title }}</h1>
              <div class="flex flex-wrap items-center justify-between gap-6">
                <p class="deck max-w-190">
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

            <div class="band">
              <section class="tile yellow main-note" aria-labelledby="main-title" data-rv>
                <span id="main-title" class="k">01 / Главное</span>
                <p class="serif">{{ summary.lead }} <span class="muted">{{ summary.rest }}</span></p>
              </section>

              <section class="tile ink flex flex-col gap-4" aria-labelledby="criteria-title" data-rv>
                <div class="flex items-center justify-between">
                  <span class="tag mint">AI · Оценка</span>
                  <span class="k muted">{{
                    state.review.materials.length > 1 ? 'Текст + слайды' : 'По материалам'
                  }}</span>
                </div>
                <h2 id="criteria-title" class="h-24">Оценка по критериям</h2>
                <div class="flex items-center gap-3.5">
                  <div class="meter" aria-hidden="true">
                    <i
                      v-for="criterion in state.review.result.criteria"
                      :key="criterion.id"
                      :class="criteriaMarks[criterion.state].meter"
                    />
                  </div>
                  <span class="num text-[13px]"
                    >{{ okCount }}
                    из {{ state.review.result.criteria.length }} в порядке</span
                  >
                </div>
                <div>
                  <div v-for="criterion in state.review.result.criteria" :key="criterion.id" class="crit">
                    <span>{{ criterion.name }}</span>
                    <span class="tag" :class="criteriaMarks[criterion.state].tag">{{
                      criteriaMarks[criterion.state].label
                    }}</span>
                  </div>
                </div>
                <p class="small muted">
                  Оценка по материалам с учётом аудитории мероприятия: уровень, кто приходит, треки, длительность слота.
                </p>
              </section>
            </div>

            <section class="mt-28" aria-labelledby="fix-title">
              <div class="mb-10 flex flex-wrap items-end justify-between gap-6" data-rv>
                <h2 id="fix-title" class="d-2">02 / Правки по приоритету</h2>
                <p class="deck">Сверху — то, что сильнее всего влияет на оценку.</p>
              </div>
              <ol class="stream m-0 list-none p-0 [--tc:120px]">
                <li v-for="(fix, i) in state.review.result.fixes" :key="fix.id" class="st stream-item">
                  <sp-stream-label label="Правка" :number="String(i + 1).padStart(2, '0')" />
                  <div class="tile fix" data-rv>
                    <div class="flex flex-col gap-2.5">
                      <span class="tag self-start" :class="{ ink: fix.priority === 'high' }">{{
                        fix.priority === 'high' ? 'Высокий' : 'Средний'
                      }}</span>
                      <h3 class="h-24">{{ fix.title }}</h3>
                      <p class="muted">{{ fix.text }}</p>
                    </div>
                    <span class="fix-at k">
                      <Presentation v-if="fix.where.startsWith('Слайд')" aria-hidden="true" />
                      <FileText v-else aria-hidden="true" />{{ fix.where }}
                    </span>
                  </div>
                </li>
              </ol>
            </section>

            <section class="mt-28" aria-labelledby="qa-title">
              <div class="mb-8 flex flex-wrap items-end justify-between gap-6" data-rv>
                <h2 id="qa-title" class="d-2">03 / Вопросы из зала</h2>
                <p class="deck">Вероятные вопросы этой аудитории и как на них ответить.</p>
              </div>
              <div class="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-4">
                <article v-for="(item, i) in state.review.result.questions" :key="item.id" class="tile qa" data-rv>
                  <span class="k muted">Вопрос {{ String(i + 1).padStart(2, '0') }}</span>
                  <h3 class="h-24">{{ item.question }}</h3>
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
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
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
const id = computed(() => String(route.params.id))
const state = shallowRef<State>({ status: 'loading' })
let timer = 0
// Номер запуска: ответ запроса от закрытой страницы или прежнего id игнорируется.
let run = 0

const steps = [
  { title: 'Читаем материалы', text: 'Текст выступления и слайды из файла.' },
  { title: 'Сверяем с аудиторией', text: 'Уровень, кто приходит, треки и длительность слота мероприятия.' },
  { title: 'Готовим правки', text: 'Оценка по четырём критериям, правки по приоритету, вопросы из зала.' },
]
const stages: TalkReviewStage[] = ['reading', 'matching', 'scoring']
const statusLines = ['Читаем материалы', 'Сверяем доклад с аудиторией мероприятия', 'Готовим правки и вопросы из зала']

const criteriaMarks: Record<CriterionState, { label: string; tag: string; meter: string }> = {
  ok: { label: 'В порядке', tag: 'mint', meter: '' },
  improve: { label: 'Доработать', tag: 'yellow', meter: 'warn' },
  weak: { label: 'Слабо', tag: 'pink', meter: 'bad' },
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
      return { label: 'Готово', class: 'mint' }
    case 'run':
      return { label: 'В работе', class: '' }
    case 'fail':
      return { label: 'Ошибка', class: 'pink' }
    default:
      return { label: failed ? 'Не начат' : 'Ждёт', class: 'dash' }
  }
}
const lowerFirst = (text: string) =>
  text[1] && text[1] === text[1].toLowerCase() ? text[0]?.toLowerCase() + text.slice(1) : text

const poll = async () => {
  const mine = run
  const res = await getTalkReview(id.value)
  if (mine !== run) return
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
  run++
  clearTimeout(timer)
  state.value = { status: 'loading' }
  return poll()
}

onMounted(start)
watch(id, start)
onBeforeUnmount(() => {
  run++
  clearTimeout(timer)
})
useFx(root, { words: 'review', rail: true })
</script>
