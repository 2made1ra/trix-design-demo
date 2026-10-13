<template>
  <sp-page>
    <div ref="root" class="flex flex-1 flex-col">
      <app-header />

      <main class="wrap pt-16">
        <div class="flex flex-wrap items-end justify-between gap-8" data-rv>
          <div class="flex flex-col gap-5">
            <span class="ribbon self-start">Подборка TRIX</span>
            <h1 class="shout text-d1">Мероприятия для вас</h1>
            <p class="text-[17px] leading-[1.55] text-ink-2">
              {{ profileLine }}
              <router-link to="/onboarding/1" class="ln text-ink">Изменить</router-link>
            </p>
          </div>
          <label
            class="flex h-12.5 w-full items-center gap-3 rounded-xs border border-field bg-paper-2 px-4 focus-within:border-mint focus-within:shadow-[inset_0_0_0_1px_var(--uv)] sm:w-100"
          >
            <Search class="size-4.5 shrink-0 text-ink-2" aria-hidden="true" />
            <span class="sr-only">Поиск по мероприятиям</span>
            <input
              ref="search"
              v-model="query"
              type="search"
              placeholder="Поиск по названию или теме"
              class="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-quiet"
            >
            <kbd
              class="rounded-xs px-1.75 py-0.5 font-mono text-[11px] text-ink-2 shadow-[inset_0_0_0_1px_var(--field)]"
              >/</kbd
            >
          </label>
        </div>

        <div class="mt-10 flex flex-wrap gap-2" data-rv>
          <button
            v-for="(filter, key) in filters"
            :key="key"
            type="button"
            class="pick"
            :aria-pressed="key === 'all' ? !active.size : active.has(key)"
            @click="toggle(key)"
          >
            {{ filter.label }}
          </button>
        </div>
      </main>

      <div v-if="cities.length" class="wrap mt-16" data-rv>
        <div class="ticker overflow-hidden rounded-[14px] fill-ink whitespace-nowrap" aria-hidden="true">
          <div class="ticker-track">
            <template v-for="city in cities" :key="city">
              <span class="text-[22px] leading-none font-bold tracking-[-0.03em]">{{ city }}</span>
              <i class="size-2 rounded-full bg-l-mint" />
            </template>
          </div>
        </div>
      </div>

      <div class="wrap flex flex-wrap items-start gap-12 pt-18 pb-30">
        <div class="flex min-w-0 flex-[999_1_560px] flex-col gap-10">
          <section v-if="offer" class="tile surface-ink flex flex-col gap-4.5" aria-labelledby="offer-title" data-rv>
            <div class="flex flex-wrap items-center gap-3">
              <span class="tag fill-mint">Предложение</span>
              <span class="kicker text-ink-2">От команды организации</span>
            </div>
            <h2 id="offer-title" class="text-[34px] leading-none font-bold">
              {{ offer.organization_name }} предлагает выступить
            </h2>
            <dl class="m-0 flex flex-wrap gap-x-10 gap-y-3">
              <div class="flex flex-col gap-1.5">
                <dt class="kicker text-ink-2">Мероприятие</dt>
                <dd class="m-0 font-semibold">{{ offer.event.name }}</dd>
              </div>
              <div v-if="offer.track" class="flex flex-col gap-1.5">
                <dt class="kicker text-ink-2">Трек</dt>
                <dd class="m-0 font-semibold">{{ offer.track }}</dd>
              </div>
              <div class="flex flex-col gap-1.5">
                <dt class="kicker text-ink-2">Ответить до</dt>
                <dd class="m-0 font-semibold">{{ formatDate(offer.answer_by) }}</dd>
              </div>
            </dl>
            <p v-if="offer.message" class="why"><b>Сообщение</b>{{ offer.message }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-3">
              <button type="button" class="b b-mint b-sm" :disabled="answering" @click="answer('accept')">
                Принять
              </button>
              <button type="button" class="b b-line b-sm" :disabled="answering" @click="answer('decline')">
                Отказаться
              </button>
              <span class="text-sm text-ink-2">После «Принять» — подготовить доклад</span>
            </div>
          </section>

          <section
            v-if="screen === 'loading'"
            class="flex flex-col gap-5"
            aria-label="Подбор мероприятий"
            aria-busy="true"
          >
            <div role="status" aria-live="polite" class="flex flex-col gap-3">
              <span class="ribbon self-start">AI подбирает</span>
              <h2 class="text-[34px] leading-none font-bold">Подбираем мероприятия под профиль</h2>
              <p class="text-sm text-ink-2">
                Сверяем темы, уровень и формат с открытыми конференциями и митапами. Обычно это занимает несколько
                секунд.
              </p>
            </div>
            <div v-for="n in 3" :key="n" class="tile skel" aria-hidden="true">
              <i class="s" /><i class="t" /><i class="m" /><i class="s" />
            </div>
          </section>

          <section
            v-else-if="screen === 'error'"
            class="tile flex flex-col gap-5"
            role="alert"
            aria-labelledby="err-title"
          >
            <span class="tag self-start fill-pink">Ошибка</span>
            <h2 id="err-title" class="text-[34px] leading-none font-bold">Не удалось загрузить подборку</h2>
            <p class="text-[17px] leading-[1.55] text-ink-2">
              Проверьте соединение и попробуйте ещё раз. Профиль и фильтры сохранены.
            </p>
            <button type="button" class="b b-ink b-sm self-start" @click="load">Повторить<RotateCw /></button>
          </section>

          <section v-else-if="screen === 'empty'" class="tile flex flex-col gap-5" aria-labelledby="empty-title">
            <span class="kicker text-ink-2">Подборка</span>
            <h2 id="empty-title" class="text-[34px] leading-none font-bold">Ничего не нашли</h2>
            <p class="text-[17px] leading-[1.55] text-ink-2">Расширьте фильтры или измените профиль.</p>
            <div class="flex flex-wrap gap-3">
              <button type="button" class="b b-ink b-sm" @click="resetFilters">Сбросить фильтры</button>
              <router-link to="/onboarding/1" class="b b-line b-sm">Изменить профиль</router-link>
            </div>
          </section>

          <section
            v-else-if="state.status === 'ready'"
            aria-label="Список мероприятий"
            class="stream [--gap:40px] [--tc:clamp(150px,12.2vw,176px)]"
          >
            <article v-for="(item, i) in visible" :key="item.conference.id" class="stream-item">
              <sp-stream-label label="Заявки до" :number="deadline(item)" />
              <div
                class="tile flex flex-col gap-4.5"
                :class="i === featured ? 'surface-mint p-10' : item.conference.kind === 'meetup' ? 'tile-slate' : ''"
                data-rv
              >
                <div class="flex flex-wrap items-center gap-3">
                  <span class="kicker" :class="{ 'text-ink-2': i !== featured }">{{ meta(item) }}</span>
                  <span v-if="isTrixSource(item.conference)" class="tag fill-ink text-l-mint">Заявка через TRIX</span>
                </div>
                <h2
                  :class="
                    i === featured
                      ? 'shout text-[clamp(44px,5vw,72px)] leading-[0.88]'
                      : 'text-[34px] leading-none font-bold'
                  "
                >
                  <router-link :to="`/c/${item.conference.slug}`" class="hover:underline">{{
                    item.conference.name
                  }}</router-link>
                </h2>
                <div v-if="item.topics.length" class="flex flex-wrap gap-2">
                  <span v-for="topic in item.topics" :key="topic" class="tag">{{ topic }}</span>
                </div>
                <p class="why"><b>Почему подходит</b>{{ item.reason }}</p>
                <div class="mt-1.5 flex flex-wrap items-center gap-4 pt-5 shadow-[inset_0_1px_0_var(--line-2)]">
                  <span class="tag mr-auto" :class="item.conference.is_paid === null && 'tag-dash'">{{
                    paidLabel(item.conference.is_paid)
                  }}</span>
                  <template v-if="isTrixSource(item.conference)">
                    <router-link
                      :to="`/c/${item.conference.slug}`"
                      class="b b-sm"
                      :class="i === featured ? 'b-ink' : 'b-line'"
                    >
                      Подать заявку<ArrowRight />
                    </router-link>
                  </template>
                  <template v-else>
                    <span class="tag tag-dash">Из открытых источников</span>
                    <a
                      v-if="item.conference.website_url"
                      :href="item.conference.website_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="b b-line b-sm"
                    >
                      Подать на сайте<span class="sr-only"> (сайт организатора)</span><ExternalLink />
                    </a>
                  </template>
                  <router-link :to="{ name: 'talks.new', query: { event: item.conference.slug } }" class="kicker ln">
                    Подготовить доклад
                  </router-link>
                </div>
              </div>
            </article>
          </section>
        </div>

        <aside class="flex min-w-0 flex-[1_1_340px] flex-col gap-4 lg:sticky lg:top-24">
          <div class="tile surface-ink flex flex-col gap-5" data-rv>
            <div class="flex items-center gap-3.5">
              <span class="ava fill-mint">{{ initials }}</span>
              <h2 class="text-2xl leading-[1.05] font-bold">Ваш профиль</h2>
            </div>
            <dl class="dl text-sm [grid-template-columns:110px_1fr]">
              <template v-for="row in profileRows" :key="row.label">
                <dt>{{ row.label }}</dt>
                <dd class="m-0">{{ row.value }}</dd>
              </template>
            </dl>
            <router-link to="/onboarding/1" class="kicker ln self-start">Изменить профиль</router-link>
          </div>
          <div class="tile surface-uv flex flex-col gap-3.5" data-rv>
            <span class="kicker">Развитие</span>
            <h2 class="text-2xl leading-[1.05] font-bold">Пока не готовы выступать?</h2>
            <p class="text-sm">Подберём площадки для старта и материалы для прокачки.</p>
            <router-link to="/onboarding/1" class="b b-mint b-sm mt-1.5 self-start"
              >Уточнить цель<ArrowRight /></router-link
            >
          </div>
          <p class="px-2 text-sm text-ink-2">
            Мероприятия публикуют организаторы в TRIX или находит TRIX в открытых источниках. Оплату отмечаем, только
            если организатор её указал.
          </p>
        </aside>
      </div>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRight, ExternalLink, RotateCw, Search } from '@lucide/vue'
import { onKeyStroke } from '@vueuse/core'
import { computed, onMounted, reactive, ref, shallowRef, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { acceptOffer, declineOffer, listMyOffers, type Offer } from '@/api/demo'
import {
  type City,
  getOnboarding,
  listCities,
  listPositionCategories,
  listRecommendations,
  type Onboarding,
  type PositionCategory,
  type Recommendation,
} from '@/api/generated'
import AppHeader from '@/components/AppHeader.vue'
import {
  conferencePlace,
  experienceLabels,
  formatDate,
  formatLabels,
  formatShortDate,
  goalLabels,
  isTrixSource,
  kindLabels,
  paidLabel,
} from '@/components/speaker/events'
import SpPage from '@/components/speaker/SpPage.vue'
import SpStreamLabel from '@/components/speaker/SpStreamLabel.vue'
import { useAuth } from '@/composables/useAuth'
import { useFx } from '@/composables/useFx'

type Filter = 'all' | 'paid' | 'conference' | 'meetup' | 'online' | 'city' | 'deadline'
type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: Recommendation[] }

const router = useRouter()
const { user } = useAuth()
const root = useTemplateRef<HTMLElement>('root')
const searchInput = useTemplateRef<HTMLInputElement>('search')
const state = shallowRef<State>({ status: 'loading' })
const query = ref('')
const active = reactive(new Set<Exclude<Filter, 'all'>>())
const onboarding = shallowRef<Onboarding | null>(null)
const categories = shallowRef<PositionCategory[]>([])
const allCities = shallowRef<City[]>([])
const offer = shallowRef<Offer | null>(null)
const answering = ref(false)

const monthEnd = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
}
const filters: Record<Filter, { label: string; test?: (item: Recommendation) => boolean }> = {
  all: { label: 'Все' },
  paid: { label: 'Оплачиваются', test: (item) => item.conference.is_paid === true },
  conference: { label: 'Конференции', test: (item) => item.conference.kind === 'conference' },
  meetup: { label: 'Митапы', test: (item) => item.conference.kind === 'meetup' },
  online: { label: 'Онлайн', test: (item) => conferencePlace(item.conference, allCities.value).format !== 'offline' },
  city: {
    label: 'В моём городе',
    test: (item) =>
      item.conference.sections.some((s) => s.city_id && s.city_id === onboarding.value?.preferred_city_id),
  },
  deadline: { label: 'Дедлайн в этом месяце', test: (item) => !!item.cfp && item.cfp.closes_at < monthEnd() },
}

const visible = computed(() => {
  if (state.value.status !== 'ready') return []
  const q = query.value.trim().toLocaleLowerCase('ru')
  return state.value.items.filter(
    (item) =>
      [...active].every((key) => filters[key].test?.(item)) &&
      (!q || [item.conference.name, ...item.topics].some((text) => text.toLocaleLowerCase('ru').includes(q))),
  )
})
// Один экран из состояния запроса и результата фильтров
const screen = computed(() =>
  state.value.status !== 'ready' ? state.value.status : visible.value.length ? 'list' : 'empty',
)
// Первое мероприятие с заявкой через TRIX выделяем крупной карточкой
const featured = computed(() => visible.value.findIndex((item) => isTrixSource(item.conference)))
const cities = computed(() => [
  ...new Set(visible.value.flatMap((item) => conferencePlace(item.conference, allCities.value).cities)),
])

const sphereNames = computed(() =>
  categories.value
    .filter((c) => onboarding.value?.position_category_ids.includes(c.id))
    .map((c) => c.name)
    .join(', '),
)
const experience = computed(() => {
  const value = onboarding.value?.speaking_experience
  return value ? experienceLabels[value] : ''
})
const profileLine = computed(() =>
  sphereNames.value && experience.value
    ? `Подобрано по сфере ${sphereNames.value} и уровню «${experience.value}».`
    : 'Подобрано по вашему профилю.',
)
const profileRows = computed(() => {
  const profile = onboarding.value
  const formats = profile?.preferred_formats.map((f) => formatLabels[f]).join(', ')
  return [
    { label: 'Сфера', value: sphereNames.value || '—' },
    { label: 'Уровень', value: experience.value || '—' },
    { label: 'Цель', value: profile?.goal ? goalLabels[profile.goal] : '—' },
    { label: 'Формат', value: formats || 'Любой' },
    { label: 'Оплата', value: profile?.paid_only ? 'Только оплачиваемые' : 'Не обязательна' },
  ]
})
const initials = computed(() => (user.value?.email ?? '').slice(0, 2))

const deadline = (item: Recommendation) => (item.cfp ? formatShortDate(item.cfp.closes_at) : '—')
const meta = (item: Recommendation) => {
  const place = conferencePlace(item.conference, allCities.value)
  return [kindLabels[item.conference.kind], place.city, formatLabels[place.format].toLowerCase()]
    .filter(Boolean)
    .join(' · ')
}

const toggle = (key: Filter) => {
  if (key === 'all') active.clear()
  else if (active.has(key)) active.delete(key)
  else active.add(key)
}
const resetFilters = () => {
  active.clear()
  query.value = ''
}

const load = async () => {
  state.value = { status: 'loading' }
  const recommendations = await listRecommendations()
  state.value =
    recommendations.status === 200 ? { status: 'ready', items: recommendations.data.items } : { status: 'error' }
}

const answer = async (kind: 'accept' | 'decline') => {
  if (!offer.value) return
  answering.value = true
  const { id, event } = offer.value
  const res = await (kind === 'accept' ? acceptOffer(id) : declineOffer(id))
  answering.value = false
  if (res.status !== 200) return void toast.error(res.data.message)
  offer.value = null
  if (kind === 'accept' && event.slug) await router.push({ name: 'talks.new', query: { event: event.slug } })
  else toast.success('Ответ отправлен команде')
}

onKeyStroke('/', (e) => {
  if (document.activeElement?.matches('input, textarea')) return
  e.preventDefault()
  searchInput.value?.focus()
})

onMounted(async () => {
  const [, onboardingRes, categoriesRes, citiesRes, offersRes] = await Promise.all([
    load(),
    getOnboarding(),
    listPositionCategories(),
    listCities(),
    listMyOffers(),
  ])
  if (onboardingRes.status === 200) onboarding.value = onboardingRes.data
  if (categoriesRes.status === 200) categories.value = categoriesRes.data
  if (citiesRes.status === 200) allCities.value = citiesRes.data
  if (offersRes.status === 200) offer.value = offersRes.data.items.find((item) => item.status === 'sent') ?? null
})

useFx(root, { words: 'selection', rail: true })
</script>
