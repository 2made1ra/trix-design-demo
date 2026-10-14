<template>
  <sp-page>
    <div ref="root" class="ev flex flex-1 flex-col">
      <app-header />

      <div v-if="state.status === 'loading'" class="wrap flex-1 pt-10" role="status" aria-busy="true">
        <span class="sr">Загружаем мероприятие</span>
        <app-tile class="skel" aria-hidden="true"
          ><i class="s" /><i class="t" /><i class="m" /><i class="s" /></app-tile
        >
      </div>

      <div v-else-if="state.status !== 'ready'" class="wrap flex-1 pt-16 pb-24">
        <app-tile as="section" class="sel-st max-w-160" :role="state.status === 'error' ? 'alert' : undefined">
          <span class="tag self-start" :class="{ pink: state.status === 'error' }">
            {{ state.status === 'error' ? 'Ошибка' : '404' }}
          </span>
          <h1 class="h-34">
            {{ state.status === 'error' ? 'Не удалось загрузить мероприятие' : 'Такого мероприятия нет' }}
          </h1>
          <p class="deck">
            {{
              state.status === 'error'
                ? 'Проверьте соединение и попробуйте ещё раз.'
                : 'Возможно, ссылка устарела или мероприятие снято с публикации.'
            }}
          </p>
          <div class="sel-acts">
            <button v-if="state.status === 'error'" type="button" class="b b-ink b-sm" @click="load">
              Повторить<RotateCw />
            </button>
            <router-link :to="listPath" class="b b-line b-sm">К мероприятиям</router-link>
          </div>
        </app-tile>
      </div>

      <div v-else class="ev-wrap w-full flex-1">
        <nav class="ev-crumbs" aria-label="Навигация">
          <router-link :to="listPath">Мероприятия</router-link>
          <span aria-hidden="true">/</span>
          <router-link :to="listPath">{{ kindPlural[state.conference.kind] }}</router-link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{{ state.conference.name }}</span>
        </nav>

        <div class="ev-cover" role="img" aria-label="Обложка мероприятия">
          <div class="org">
            <span>Организатор</span>
            <b>{{ organizer }}</b>
          </div>
          <div class="ev-logo" aria-hidden="true">{{ logo }}</div>
        </div>

        <section class="ev-title" data-rv>
          <div class="ev-chips">
            <span class="ev-chip acc">{{ kindLabels[state.conference.kind] }}</span>
            <span class="ev-chip">{{ trix ? 'Заявка через TRIX' : 'Из открытых источников' }}</span>
          </div>
          <h1 class="ev-h1 d-1">{{ state.conference.name }}</h1>
          <div class="ev-meta">
            <span><CalendarDays aria-hidden="true" />{{ dates }}</span>
            <span><MapPin aria-hidden="true" />{{ place }}</span>
            <span>Организатор: {{ organizer }}</span>
          </div>
          <p v-if="state.reason" class="why"><b>Почему подходит</b>{{ state.reason }}</p>
          <nav class="ev-tabs" aria-label="Разделы мероприятия">
            <a
              v-for="tab in tabs"
              :key="tab.hash"
              :href="tab.hash"
              :aria-current="(route.hash || '#about') === tab.hash ? 'true' : undefined"
            >
              {{ tab.label }}
            </a>
          </nav>
        </section>

        <div class="ev-grid">
          <main>
            <section id="about" class="ev-sec" data-rv>
              <h2 class="ev-h2">О мероприятии</h2>
              <p class="ev-lead">{{ state.conference.description ?? 'Описание пока не добавлено.' }}</p>
            </section>

            <section id="aud" class="ev-sec" data-rv>
              <h2 class="ev-h2">Аудитория</h2>
              <dl class="ev-facts">
                <div v-for="fact in facts" :key="fact.label">
                  <dt class="ev-label">{{ fact.label }}</dt>
                  <dd>{{ fact.value }}</dd>
                </div>
              </dl>
            </section>

            <section v-if="state.tracks.length" id="tracks" class="ev-sec" data-rv>
              <h2 class="ev-h2">Треки</h2>
              <ul class="ev-tracks">
                <li v-for="(track, i) in state.tracks" :key="track.name">
                  <span class="ev-n">{{ String(i + 1).padStart(2, '0') }}</span>
                  <div>
                    <h3 class="ev-h3">{{ track.name }}</h3>
                    <p>{{ track.description }}</p>
                  </div>
                </li>
              </ul>
            </section>

            <section id="terms" class="ev-sec" data-rv>
              <h2 class="ev-h2">Условия для спикеров</h2>
              <dl class="ev-dl">
                <div v-for="term in terms" :key="term.label">
                  <dt>{{ term.label }}</dt>
                  <dd>
                    <span
                      v-if="term.chip"
                      class="ev-chip"
                      :class="{ 'text-quiet': state.conference.is_paid === null }"
                      >{{
                        term.value
                      }}</span
                    >
                    <template v-else>{{ term.value }}</template>
                  </dd>
                </div>
              </dl>
            </section>

            <section id="apply" class="ev-sec" data-rv>
              <h2 class="ev-h2">Как подать заявку</h2>
              <p v-if="!trix" class="ev-lead">Заявка подаётся на сайте организатора.</p>
              <ol v-else class="ev-steps">
                <li v-for="(step, i) in steps" :key="step.title">
                  <span class="ev-label">Шаг {{ i + 1 }}</span>
                  <h3 class="ev-h3">{{ step.title }}</h3>
                  <p>{{ step.text }}</p>
                </li>
              </ol>
            </section>
          </main>

          <aside class="ev-side">
            <section class="ev-card deadline" aria-labelledby="deadline-title" data-rv>
              <template v-if="state.cfp">
                <div class="flex items-center justify-between gap-3">
                  <span class="ev-label">Заявки до</span>
                  <span class="ev-chip" :class="{ ok: state.cfp.is_open }">{{
                    state.cfp.is_open ? 'Приём открыт' : 'Приём закрыт'
                  }}</span>
                </div>
                <h2 id="deadline-title" class="ev-when">{{ formatDate(state.cfp.closes_at) }}</h2>
              </template>
              <h2 v-else id="deadline-title" class="ev-when text-[44px]">Даты приёма не указаны</h2>
              <dl class="ev-kv">
                <dt>Даты</dt>
                <dd>{{ dates }}</dd>
                <dt>Место</dt>
                <dd>{{ place }}</dd>
                <dt>Организатор</dt>
                <dd>{{ organizer }}</dd>
              </dl>
              <div class="ev-cta">
                <router-link
                  v-if="user"
                  :to="{ name: 'talks.new', query: { event: state.conference.slug } }"
                  class="b b-ink"
                >
                  Подготовить доклад<ArrowRight />
                </router-link>
                <router-link v-else to="/register" class="b b-ink">Начать<ArrowRight /></router-link>
                <router-link v-if="trix && user" :to="{ hash: '#apply' }" class="b b-line">Подать заявку</router-link>
                <a
                  v-if="!trix && state.conference.website_url"
                  :href="state.conference.website_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="b b-line"
                >
                  Подать на сайте<span class="sr"> (сайт организатора)</span><ExternalLink />
                </a>
              </div>
              <p v-if="!trix && domain" class="ev-micro">Из открытых источников · {{ domain }}</p>
              <p v-else-if="trix" class="ev-micro">
                {{
                  user
                    ? 'Данные профиля подставятся в заявку сами.'
                    : 'Заявку подают после регистрации — данные профиля подставятся в неё сами.'
                }}
              </p>
            </section>

            <section v-if="!user" class="ev-card soft" data-rv>
              <h3 class="ev-h3">Впервые в TRIX?</h3>
              <p class="ev-muted">TRIX подбирает мероприятия под ваши темы и помогает подготовить доклад до подачи.</p>
              <router-link to="/speakers" class="ev-more self-start">Как работает TRIX →</router-link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRight, CalendarDays, ExternalLink, MapPin, RotateCw } from '@lucide/vue'
import { computed, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { type EventTrack, listEventTracks } from '@/api/demo'
import {
  type Cfp,
  type City,
  type Conference,
  getConferenceBySlug,
  listCFPs,
  listCities,
  listRecommendations,
} from '@/api/generated'
import AppHeader from '@/components/AppHeader.vue'
import AppTile from '@/components/AppTile.vue'
import {
  conferencePlace,
  formatDate,
  formatLabels,
  formatRange,
  isTrixSource,
  kindLabels,
  levelLabels,
  paidLabel,
} from '@/components/speaker/events'
import SpPage from '@/components/speaker/SpPage.vue'
import { useAuth } from '@/composables/useAuth'
import { useFx } from '@/composables/useFx'

type State =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' }
  | {
      status: 'ready'
      conference: Conference
      cfp: Cfp | null
      tracks: EventTrack[]
      cities: City[]
      /** Почему подходит — только для вошедшего и только если мероприятие в его подборке */
      reason: string | null
    }

const route = useRoute()
const { user } = useAuth()
const root = useTemplateRef<HTMLElement>('root')
const state = shallowRef<State>({ status: 'loading' })

const kindPlural = { conference: 'Конференции', meetup: 'Митапы', workshop: 'Воркшопы', other: 'Другие форматы' }

const slug = computed(() => String(route.params.slug))
const listPath = computed(() => (user.value ? '/events' : '/speakers'))
const ready = computed(() => (state.value.status === 'ready' ? state.value : null))
const trix = computed(() => !!ready.value && isTrixSource(ready.value.conference))
const organizer = computed(() => ready.value?.conference.organizer_name ?? 'Не указан')
const logo = computed(() =>
  organizer.value
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase(),
)
const dates = computed(() =>
  ready.value ? formatRange(ready.value.conference.start_at, ready.value.conference.end_at) : '',
)
const place = computed(() => {
  if (!ready.value) return ''
  const { city, format } = conferencePlace(ready.value.conference, ready.value.cities)
  return [city, formatLabels[format].toLowerCase()].filter(Boolean).join(', ')
})
const domain = computed(() => {
  try {
    return new URL(ready.value?.conference.website_url ?? '').hostname
  } catch {
    return ''
  }
})

const tabs = computed(() => [
  { label: 'О мероприятии', hash: '#about' },
  { label: 'Аудитория', hash: '#aud' },
  ...(ready.value?.tracks.length ? [{ label: 'Треки', hash: '#tracks' }] : []),
  { label: 'Условия', hash: '#terms' },
  { label: 'Заявка', hash: '#apply' },
])
const facts = computed(() => {
  const conference = ready.value?.conference
  if (!conference) return []
  const { cities, format } = conferencePlace(conference, ready.value?.cities ?? [])
  const where = cities.length ? `${cities.join(', ')}, ${formatLabels[format].toLowerCase()}` : formatLabels[format]
  return [
    {
      label: 'Уровень',
      value: conference.audience_levels.map((level) => levelLabels[level]).join(', ') || 'Любой',
    },
    { label: 'Кто приходит', value: conference.audience ?? 'Не указано' },
    { label: 'Формат', value: where },
  ]
})
const terms = computed(() => {
  const conference = ready.value?.conference
  if (!conference) return []
  const slot = [
    conference.talk_minutes && `Доклад ${conference.talk_minutes} мин`,
    conference.qa_minutes && `вопросы ${conference.qa_minutes} мин`,
  ]
    .filter(Boolean)
    .join(' и ')
  return [
    { label: 'Длительность слота', value: slot || 'Не указана', chip: false },
    { label: 'Оплата', value: paidLabel(conference.is_paid), chip: true },
    { label: 'Дорога и проживание', value: conference.travel_terms ?? 'Не указано', chip: false },
    ...(conference.speaker_perks
      ? [{ label: 'Что ещё даём спикерам', value: conference.speaker_perks, chip: false }]
      : []),
  ]
})
const steps = computed(() => [
  { title: 'Выберите доклад', text: 'Загрузите материалы или опишите новый доклад.' },
  { title: 'Ответьте на вопросы', text: 'Укажите трек, длительность и ответьте на вопросы организатора.' },
  {
    title: 'Дождитесь решения',
    text: ready.value?.cfp?.answer_by
      ? `Ответ придёт письмом до ${formatDate(ready.value.cfp.answer_by)}.`
      : 'Ответ придёт письмом.',
  },
])

const load = async () => {
  state.value = { status: 'loading' }
  const res = await getConferenceBySlug(slug.value)
  if (res.status === 404) {
    state.value = { status: 'notFound' }
    return
  }
  if (res.status !== 200) {
    state.value = { status: 'error' }
    return
  }
  const conference = res.data

  const [cfps, tracks, cities, recommendations] = await Promise.all([
    listCFPs({ conference_id: conference.id }),
    listEventTracks(slug.value),
    listCities(),
    user.value ? listRecommendations() : null,
  ])
  state.value = {
    status: 'ready',
    conference,
    cfp: cfps.status === 200 ? (cfps.data.items[0] ?? null) : null,
    tracks: tracks.status === 200 ? tracks.data : [],
    cities: cities.status === 200 ? cities.data : [],
    reason:
      recommendations?.status === 200
        ? (recommendations.data.items.find((item) => item.conference.id === conference.id)?.reason ?? null)
        : null,
  }
}

onMounted(load)
watch(slug, load)

useFx(root, { words: 'landing', ink: true })
</script>
