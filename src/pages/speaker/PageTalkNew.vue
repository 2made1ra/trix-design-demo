<template>
  <sp-page :calm="true">
    <div ref="root" class="flex flex-1 flex-col">
      <app-header />

      <main class="wrap pt-10 pb-30">
        <div v-if="event.status === 'loading'" class="mt-12 max-w-215" role="status" aria-busy="true">
          <span class="sr-only">Загружаем мероприятие</span>
          <div class="tile skel" aria-hidden="true"><i class="s" /><i class="t" /><i class="m" /><i class="s" /></div>
        </div>

        <section
          v-else-if="event.status !== 'ready'"
          class="tile mt-12 flex max-w-160 flex-col gap-5"
          :role="event.status === 'error' ? 'alert' : undefined"
        >
          <h1 class="text-[34px] leading-none font-bold">
            {{ event.status === 'error' ? 'Не удалось загрузить мероприятие' : 'Выберите мероприятие' }}
          </h1>
          <p class="text-[17px] leading-[1.55] text-ink-2">
            {{
              event.status === 'error'
                ? 'Проверьте соединение и попробуйте ещё раз.'
                : 'Разбор делается под аудиторию конкретного мероприятия: выберите его в подборке и нажмите «Подготовить доклад».'
            }}
          </p>
          <div class="flex flex-wrap gap-3">
            <button v-if="event.status === 'error'" type="button" class="b b-ink b-sm" @click="loadEvent">
              Повторить<RotateCw />
            </button>
            <router-link to="/events" class="b b-line b-sm">К мероприятиям</router-link>
          </div>
        </section>

        <template v-else>
          <nav aria-label="Путь по разделу" class="kicker flex flex-wrap gap-2.5 text-ink-2">
            <router-link to="/events" class="hover:text-ink">Мероприятия</router-link>
            <span aria-hidden="true">/</span>
            <router-link :to="`/c/${event.conference.slug}`" class="hover:text-ink">{{
              event.conference.name
            }}</router-link>
            <span aria-hidden="true">/</span>
            <span class="text-ink" aria-current="page">Подготовить доклад</span>
          </nav>

          <div class="mt-12 flex max-w-215 flex-col gap-5" data-rv>
            <span class="ribbon self-start">Разбор до выступления</span>
            <h1 class="shout text-d1">Подготовить доклад</h1>
            <p class="text-[17px] leading-[1.55] text-ink-2">
              Добавьте текст выступления или слайды. Разберём доклад под аудиторию этого мероприятия: что поправить и в
              каком порядке.
            </p>
          </div>

          <div class="mt-14 flex flex-wrap items-start gap-12">
            <form class="flex min-w-0 flex-[999_1_560px] flex-col gap-12" novalidate @submit.prevent="submit">
              <fieldset class="m-0 flex min-w-0 flex-col gap-12 border-0 p-0" :disabled="sending">
                <div class="field" data-rv>
                  <span class="idx kicker text-ink-2" aria-hidden="true">01 / Доклад</span>
                  <label for="talk-title">Название доклада</label>
                  <input
                    id="talk-title"
                    v-model="title"
                    class="inp"
                    type="text"
                    placeholder="Например, «Как мы перешли на очереди»"
                  >
                </div>

                <div class="field" data-rv>
                  <span class="idx kicker text-ink-2" aria-hidden="true">02 / Материалы</span>
                  <label for="talk-text">Текст выступления</label>
                  <textarea
                    id="talk-text"
                    v-model="text"
                    class="inp min-h-85 text-base"
                    rows="14"
                    aria-describedby="talk-text-count talk-need"
                    :aria-invalid="!!errors.material"
                    placeholder="Вставьте текст целиком или тезисами, как будете говорить со сцены"
                    @input="errors.material = ''"
                  />
                  <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <span class="hint">Текст можно вставить из заметок или документа, форматирование не важно.</span>
                    <span id="talk-text-count" class="kicker text-ink-2" aria-live="polite">{{ count }}</span>
                  </div>
                </div>

                <div class="field" data-rv>
                  <span id="pdf-label" class="legend">PDF презентации</span>

                  <label
                    v-if="pdf.kind === 'none'"
                    class="drop"
                    :class="{ 'outline-2 outline-pink': !!errors.material }"
                    :data-over="dragging || undefined"
                    @dragover.prevent="dragging = true"
                    @dragleave="dragging = false"
                    @drop.prevent="onDrop"
                  >
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      aria-labelledby="pdf-label"
                      aria-describedby="pdf-limit talk-need"
                      @change="onPick"
                    >
                    <Upload aria-hidden="true" />
                    <span class="text-xl leading-[1.1] font-bold">
                      Перетащите PDF или <span class="ln">выберите файл</span>
                    </span>
                    <span id="pdf-limit" class="hint">
                      Только PDF, до {{ MAX_MB }} МБ. Из PowerPoint и Keynote сохраните через «Экспорт в PDF».
                    </span>
                  </label>

                  <div v-else class="flex flex-col gap-3">
                    <div class="file" :class="{ 'file-bad': pdf.kind === 'bad' }">
                      <FileX v-if="pdf.kind === 'bad'" aria-hidden="true" />
                      <FileText v-else aria-hidden="true" />
                      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                        <b class="truncate font-semibold">{{ pdf.file.name }}</b>
                        <span class="text-sm text-ink-2">{{ fileMeta(pdf.file) }}</span>
                      </div>
                      <span v-if="pdf.kind === 'ok'" class="tag fill-mint">Загружен</span>
                      <label v-else class="lnk relative">
                        Выбрать другой
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          class="absolute size-px opacity-0"
                          @change="onPick"
                        >
                      </label>
                      <button
                        type="button"
                        class="lnk"
                        :aria-label="`Убрать файл ${pdf.file.name}`"
                        @click="pdf = { kind: 'none' }"
                      >
                        Убрать
                      </button>
                    </div>
                    <p v-if="pdf.kind === 'bad'" class="err" role="alert">
                      <CircleAlert />{{ pdf.reason === 'type' ? typeError(pdf.file) : sizeError }}
                    </p>
                  </div>
                </div>

                <p id="talk-need" class="hint -mt-6" data-rv>Нужен текст или PDF, можно оба.</p>
              </fieldset>

              <div
                v-if="errors.material || errors.form"
                class="flex flex-col gap-1.5 rounded-[18px] bg-[color-mix(in_srgb,var(--pink)_28%,var(--bg))] px-5 py-4.5"
                role="alert"
              >
                <template v-if="errors.material">
                  <b>Добавьте текст или PDF</b>
                  <span class="text-sm">{{ errors.material }}</span>
                </template>
                <span v-else>{{ errors.form }}</span>
              </div>

              <div
                class="flex flex-wrap items-center justify-between gap-4 pt-7 shadow-[inset_0_1px_0_var(--line)]"
                data-rv
              >
                <router-link :to="`/c/${event.conference.slug}`" class="kicker ln">Отмена</router-link>
                <button type="submit" class="b b-mint" :disabled="sending" :aria-busy="sending">
                  <template v-if="sending">
                    <LoaderCircle class="animate-spin" aria-hidden="true" />Отправляем
                  </template>
                  <template v-else>Получить разбор<ArrowRight /></template>
                </button>
              </div>
            </form>

            <aside class="flex min-w-0 flex-[1_1_340px] flex-col gap-4 lg:sticky lg:top-24">
              <section class="tile surface-ink flex flex-col gap-5" aria-labelledby="ctx-title" data-rv>
                <span class="kicker text-ink-2">Разбор под аудиторию</span>
                <div class="flex flex-col gap-2">
                  <h2 id="ctx-title" class="text-2xl leading-[1.05] font-bold">{{ event.conference.name }}</h2>
                  <span class="text-sm text-ink-2">{{ eventMeta }}</span>
                </div>
                <dl class="dl text-sm [grid-template-columns:120px_1fr]">
                  <dt>Уровень</dt>
                  <dd class="m-0">{{ levels }}</dd>
                  <dt>Кто приходит</dt>
                  <dd class="m-0">{{ event.conference.audience ?? 'Не указано' }}</dd>
                  <dt>Слот</dt>
                  <dd class="m-0">
                    {{ event.conference.talk_minutes ? `${event.conference.talk_minutes} мин` : 'Не указан' }}
                  </dd>
                  <template v-if="event.tracks.length">
                    <dt>Треки</dt>
                    <dd class="m-0 flex flex-wrap gap-1.5">
                      <span v-for="track in event.tracks" :key="track.name" class="tag">{{ track.name }}</span>
                    </dd>
                  </template>
                </dl>
                <span class="kicker flex items-center gap-2"><Lock class="size-3.5" />Разбор видите только вы</span>
              </section>
              <section class="tile tile-slate flex flex-col gap-3" aria-labelledby="what-title" data-rv>
                <h2 id="what-title" class="text-xl leading-[1.1] font-bold">Что будет в разборе</h2>
                <ul class="ticks text-sm">
                  <li>Оценка по четырём критериям: аудитория, структура, главная мысль, укладывается ли во время</li>
                  <li>Правки по приоритету с привязкой к месту в тексте или номеру слайда</li>
                  <li>Вопросы, которые вероятно зададут из зала</li>
                </ul>
              </section>
            </aside>
          </div>
        </template>
      </main>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRight, CircleAlert, FileText, FileX, LoaderCircle, Lock, RotateCw, Upload } from '@lucide/vue'
import { computed, onMounted, reactive, ref, shallowRef, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { createTalkReview, type EventTrack, listEventTracks } from '@/api/demo'
import { type City, type Conference, getConferenceBySlug, listCities } from '@/api/generated'
import AppHeader from '@/components/AppHeader.vue'
import { conferencePlace, formatLabels, isTrixSource, kindLabels, levelLabels } from '@/components/speaker/events'
import SpPage from '@/components/speaker/SpPage.vue'
import { useFx } from '@/composables/useFx'

type EventState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error' }
  | { status: 'ready'; conference: Conference; tracks: EventTrack[]; cities: City[] }
type PdfState = { kind: 'none' } | { kind: 'ok'; file: File } | { kind: 'bad'; file: File; reason: 'type' | 'size' }

const MAX_MB = 20
const MAX_BYTES = MAX_MB * 1024 * 1024

const route = useRoute()
const router = useRouter()
const root = useTemplateRef<HTMLElement>('root')
const slug = typeof route.query.event === 'string' ? route.query.event : ''
const event = shallowRef<EventState>({ status: 'loading' })
const title = ref('')
const text = ref('')
const pdf = shallowRef<PdfState>({ kind: 'none' })
const dragging = ref(false)
const sending = ref(false)
const errors = reactive({ material: '', form: '' })

const count = computed(() => (text.value.length ? `${text.value.length.toLocaleString('ru')} знаков` : 'Пока пусто'))
const sizeError = `Файл больше ${MAX_MB} МБ. Сожмите PDF или уберите из слайдов видео и тяжёлые картинки.`
const typeError = (file: File) =>
  `Нужен PDF, а это ${file.name.includes('.') ? `.${file.name.split('.').pop()}` : 'другой формат'}. Сохраните презентацию через «Экспорт в PDF» и загрузите снова.`
const fileMeta = (file: File) =>
  `${file.type === 'application/pdf' ? 'PDF' : (file.name.split('.').pop()?.toUpperCase() ?? 'Файл')} · ${(file.size / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`

const eventMeta = computed(() => {
  if (event.value.status !== 'ready') return ''
  const { conference, cities } = event.value
  const place = conferencePlace(conference, cities)
  return [
    kindLabels[conference.kind],
    place.city,
    formatLabels[place.format].toLowerCase(),
    isTrixSource(conference) ? 'заявка через TRIX' : 'из открытых источников',
  ]
    .filter(Boolean)
    .join(' · ')
})
const levels = computed(() =>
  event.value.status === 'ready'
    ? event.value.conference.audience_levels.map((level) => levelLabels[level]).join(', ') || 'Любой'
    : '',
)

const accept = (file: File | undefined) => {
  if (!file) return
  errors.material = ''
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  pdf.value = !isPdf
    ? { kind: 'bad', file, reason: 'type' }
    : file.size > MAX_BYTES
      ? { kind: 'bad', file, reason: 'size' }
      : { kind: 'ok', file }
}
const onPick = (e: Event) => {
  const input = e.target as HTMLInputElement
  accept(input.files?.[0])
  input.value = ''
}
const onDrop = (e: DragEvent) => {
  dragging.value = false
  accept(e.dataTransfer?.files[0])
}

const loadEvent = async () => {
  if (!slug) {
    event.value = { status: 'missing' }
    return
  }
  event.value = { status: 'loading' }
  const res = await getConferenceBySlug(slug)
  if (res.status === 404) {
    event.value = { status: 'missing' }
    return
  }
  if (res.status !== 200) {
    event.value = { status: 'error' }
    return
  }
  const [tracks, cities] = await Promise.all([listEventTracks(slug), listCities()])
  event.value = {
    status: 'ready',
    conference: res.data,
    tracks: tracks.status === 200 ? tracks.data : [],
    cities: cities.status === 200 ? cities.data : [],
  }
}

const submit = async () => {
  errors.material = ''
  errors.form = ''
  if (pdf.value.kind === 'bad') return
  if (!text.value.trim() && pdf.value.kind === 'none') {
    errors.material = 'Без материалов разбирать нечего. Вставьте текст выступления или приложите слайды в PDF.'
    return
  }

  sending.value = true
  const res = await createTalkReview({
    event_slug: slug,
    title: title.value.trim() || undefined,
    text: text.value.trim() || undefined,
    file: pdf.value.kind === 'ok' ? pdf.value.file : undefined,
  })
  sending.value = false

  if (res.status === 201) return void (await router.push(`/talks/${res.data.id}`))
  if (res.data.key === 'invalid_material')
    errors.material = 'Не удалось прочитать материалы. Вставьте текст выступления или приложите слайды в PDF.'
  else {
    errors.form = res.data.message
    toast.error(res.data.message)
  }
}

onMounted(loadEvent)
useFx(root, { words: 'review' })
</script>
