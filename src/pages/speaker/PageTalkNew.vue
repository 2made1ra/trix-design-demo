<template>
  <sp-page :calm="true">
    <div ref="root" class="flex flex-1 flex-col">
      <app-header />

      <main class="wrap pt-10 pb-30">
        <div v-if="event.status === 'loading'" class="mt-12 max-w-215" role="status" aria-busy="true">
          <span class="sr">Загружаем мероприятие</span>
          <app-tile class="skel" aria-hidden="true"
            ><i class="s" /><i class="t" /><i class="m" /><i class="s" /></app-tile
          >
        </div>

        <app-tile
          v-else-if="event.status !== 'ready'"
          as="section"
          class="sel-st mt-12 max-w-160"
          :role="event.status === 'error' ? 'alert' : undefined"
        >
          <h1 class="h-34">
            {{ event.status === 'error' ? 'Не удалось загрузить мероприятие' : 'Выберите мероприятие' }}
          </h1>
          <p class="deck">
            {{
              event.status === 'error'
                ? 'Проверьте соединение и попробуйте ещё раз.'
                : 'Разбор делается под аудиторию конкретного мероприятия: выберите его в подборке и нажмите «Подготовить доклад».'
            }}
          </p>
          <div class="sel-acts">
            <app-button v-if="event.status === 'error'" variant="ink" sm @click="loadEvent">
              Повторить<RotateCw />
            </app-button>
            <app-button to="/events" variant="line" sm>К мероприятиям</app-button>
          </div>
        </app-tile>

        <template v-else>
          <nav aria-label="Путь по разделу" class="crumbs k">
            <router-link to="/events">Мероприятия</router-link>
            <span aria-hidden="true">/</span>
            <router-link :to="`/c/${event.conference.slug}`">{{ event.conference.name }}</router-link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Подготовить доклад</span>
          </nav>

          <div class="mt-12 flex max-w-215 flex-col gap-5" data-rv>
            <span class="ribbon self-start">Разбор до выступления</span>
            <h1 class="d-1">Подготовить доклад</h1>
            <p class="deck">
              Добавьте текст выступления или слайды. Разберём доклад под аудиторию этого мероприятия: что поправить и в
              каком порядке.
            </p>
          </div>

          <div class="mt-14 flex flex-wrap items-start gap-12">
            <form class="flex min-w-0 flex-[999_1_560px] flex-col gap-12" novalidate @submit.prevent="submit">
              <fieldset class="m-0 flex min-w-0 flex-col gap-12 border-0 p-0" :disabled="sending">
                <app-field
                  id="talk-title"
                  v-model="title"
                  kicker="01 / Доклад"
                  label="Название доклада"
                  placeholder="Например, «Как мы перешли на очереди»"
                  data-rv
                />

                <app-field id="talk-text" kicker="02 / Материалы" label="Текст выступления" data-rv>
                  <textarea
                    id="talk-text"
                    v-model="text"
                    class="inp ta"
                    rows="14"
                    aria-describedby="talk-text-count talk-need"
                    :aria-invalid="!!errors.material"
                    placeholder="Вставьте текст целиком или тезисами, как будете говорить со сцены"
                    @input="errors.material = ''"
                  />
                  <div class="meta">
                    <span class="hint">Текст можно вставить из заметок или документа, форматирование не важно.</span>
                    <span id="talk-text-count" class="k muted" aria-live="polite">{{ count }}</span>
                  </div>
                </app-field>

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
                    <span class="h-20"> Перетащите PDF или <span class="ln">выберите файл</span> </span>
                    <span id="pdf-limit" class="hint">
                      Только PDF, до {{ MAX_MB }} МБ. Из PowerPoint и Keynote сохраните через «Экспорт в PDF».
                    </span>
                  </label>

                  <div v-else class="flex flex-col gap-3">
                    <div class="file" :class="{ 'file-bad': pdf.kind === 'bad' }">
                      <FileX v-if="pdf.kind === 'bad'" aria-hidden="true" />
                      <FileText v-else aria-hidden="true" />
                      <div class="cell">
                        <b class="truncate">{{ pdf.file.name }}</b>
                        <span class="small muted">{{ fileMeta(pdf.file) }}</span>
                      </div>
                      <app-tag v-if="pdf.kind === 'ok'" tone="mint">Загружен</app-tag>
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
                    <p v-if="pdf.kind === 'bad'" class="err dot" role="alert">
                      {{ pdf.reason === 'type' ? typeError(pdf.file) : sizeError }}
                    </p>
                  </div>
                </div>

                <p id="talk-need" class="hint -mt-6" data-rv>Нужен текст или PDF, можно оба.</p>
              </fieldset>

              <div v-if="errors.material || errors.form" class="formerr" role="alert">
                <template v-if="errors.material">
                  <b>Добавьте текст или PDF</b>
                  <span class="small">{{ errors.material }}</span>
                </template>
                <span v-else>{{ errors.form }}</span>
              </div>

              <div class="next flex-wrap" data-rv>
                <router-link :to="`/c/${event.conference.slug}`" class="k ln">Отмена</router-link>
                <app-button type="submit" variant="mint" :disabled="sending" :aria-busy="sending">
                  <template v-if="sending">
                    <LoaderCircle class="animate-spin" aria-hidden="true" />Отправляем
                  </template>
                  <template v-else>Получить разбор<ArrowRight /></template>
                </app-button>
              </div>
            </form>

            <aside class="flex min-w-0 flex-[1_1_340px] flex-col gap-4 lg:sticky lg:top-24">
              <app-tile as="section" tone="ink" class="flex flex-col gap-5" aria-labelledby="ctx-title" data-rv>
                <span class="k muted">Разбор под аудиторию</span>
                <div class="flex flex-col gap-2">
                  <h2 id="ctx-title" class="h-24">{{ event.conference.name }}</h2>
                  <span class="small muted">{{ eventMeta }}</span>
                </div>
                <dl class="dl small [grid-template-columns:120px_1fr]">
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
                      <app-tag v-for="track in event.tracks" :key="track.name">{{ track.name }}</app-tag>
                    </dd>
                  </template>
                </dl>
                <span class="k lock"><Lock />Разбор видите только вы</span>
              </app-tile>
              <app-tile as="section" tone="slate" class="flex flex-col gap-3" aria-labelledby="what-title" data-rv>
                <h2 id="what-title" class="h-20">Что будет в разборе</h2>
                <ul class="crit small">
                  <li>Оценка по четырём критериям: аудитория, структура, главная мысль, укладывается ли во время</li>
                  <li>Правки по приоритету с привязкой к месту в тексте или номеру слайда</li>
                  <li>Вопросы, которые вероятно зададут из зала</li>
                </ul>
              </app-tile>
            </aside>
          </div>
        </template>
      </main>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRight, FileText, FileX, LoaderCircle, Lock, RotateCw, Upload } from '@lucide/vue'
import { computed, onMounted, reactive, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { createTalkReview, type EventTrack, listEventTracks } from '@/api/demo'
import { type City, type Conference, getConferenceBySlug, listCities } from '@/api/generated'
import AppButton from '@/components/AppButton.vue'
import AppField from '@/components/AppField.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppTag from '@/components/AppTag.vue'
import AppTile from '@/components/AppTile.vue'
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
const slug = computed(() => (typeof route.query.event === 'string' ? route.query.event : ''))
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
  if (!slug.value) {
    event.value = { status: 'missing' }
    return
  }
  event.value = { status: 'loading' }
  const res = await getConferenceBySlug(slug.value)
  if (res.status === 404) {
    event.value = { status: 'missing' }
    return
  }
  if (res.status !== 200) {
    event.value = { status: 'error' }
    return
  }
  const [tracks, cities] = await Promise.all([listEventTracks(slug.value), listCities()])
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
    event_slug: slug.value,
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
watch(slug, loadEvent)
useFx(root, { words: 'review' })
</script>
