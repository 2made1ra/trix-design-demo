<template>
  <sp-page>
    <div ref="root" class="flex flex-1 flex-col">
      <app-header />

      <main class="wrap pt-16 pb-30">
        <div class="flex flex-wrap items-end justify-between gap-8" data-rv>
          <div class="flex flex-col gap-5">
            <span class="ribbon self-start">Подборка TRIX</span>
            <h1 class="d-1">Мероприятия для вас</h1>
            <p class="deck">
              {{ profileLine }}
              <router-link to="/onboarding/1" class="ln text-ink">Изменить</router-link>
            </p>
          </div>
          <label class="search">
            <Search aria-hidden="true" />
            <span class="sr">Поиск по мероприятиям</span>
            <input ref="search" v-model="query" type="search" placeholder="Поиск по названию или теме">
            <kbd class="num">/</kbd>
          </label>
        </div>

        <div class="mt-10 flex flex-wrap gap-2" data-rv>
          <app-pick
            v-for="(filter, key) in filters"
            :key="key"
            :pressed="key === 'all' ? !active.size : active.has(key)"
            @click="toggle(key)"
          >
            {{ filter.label }}
          </app-pick>
        </div>
      </main>

      <app-ticker v-if="cities.length" :items="cities" ink class="-mt-14" />

      <div class="wrap row2 pt-18 pb-30">
        <div>
          <app-tile v-if="offer" as="section" tone="ink" class="offer" aria-labelledby="offer-title" data-rv>
            <div class="offer-top">
              <app-tag tone="mint">Предложение</app-tag>
              <span class="k muted">От команды организации</span>
            </div>
            <h2 id="offer-title" class="h-34">{{ offer.organization_name }} предлагает выступить</h2>
            <dl>
              <div>
                <dt class="k muted">Мероприятие</dt>
                <dd>{{ offer.event.name }}</dd>
              </div>
              <div v-if="offer.track">
                <dt class="k muted">Трек</dt>
                <dd>{{ offer.track }}</dd>
              </div>
              <div>
                <dt class="k muted">Ответить до</dt>
                <dd>{{ formatDate(offer.answer_by) }}</dd>
              </div>
            </dl>
            <p v-if="offer.message" class="why"><b>Сообщение</b>{{ offer.message }}</p>
            <div class="sel-acts items-center">
              <app-button variant="mint" sm :disabled="answering" @click="answer('accept')">
                Принять<span class="sr">: подготовить доклад</span>
              </app-button>
              <app-button variant="line" sm :disabled="answering" @click="answer('decline')"> Отказаться </app-button>
              <span class="small muted">После «Принять» — подготовить доклад</span>
            </div>
          </app-tile>

          <section v-if="screen === 'loading'" class="sel-st" aria-label="Подбор мероприятий" aria-busy="true">
            <div role="status" aria-live="polite" class="flex flex-col gap-3">
              <span class="ribbon self-start">AI подбирает</span>
              <h2 class="h-34">Подбираем мероприятия под профиль</h2>
              <p class="small muted">
                Сверяем темы, уровень и формат с открытыми конференциями и митапами. Обычно это занимает несколько
                секунд.
              </p>
            </div>
            <app-tile v-for="n in 3" :key="n" class="skel" aria-hidden="true">
              <i class="s" /><i class="t" /><i class="m" /><i class="s" />
            </app-tile>
          </section>

          <app-tile v-else-if="screen === 'error'" as="section" class="sel-st" role="alert" aria-labelledby="err-title">
            <app-tag tone="pink" class="self-start">Ошибка</app-tag>
            <h2 id="err-title" class="h-34">Не удалось загрузить подборку</h2>
            <p class="deck">Проверьте соединение и попробуйте ещё раз. Профиль и фильтры сохранены.</p>
            <div class="sel-acts">
              <app-button variant="ink" sm @click="load">Повторить<RotateCw /></app-button>
            </div>
          </app-tile>

          <app-tile v-else-if="screen === 'empty'" as="section" class="sel-st" aria-labelledby="empty-title">
            <span class="k muted">Подборка</span>
            <h2 id="empty-title" class="h-34">Ничего не нашли</h2>
            <p class="deck">Расширьте фильтры или измените профиль.</p>
            <div class="sel-acts">
              <app-button variant="ink" sm @click="resetFilters">Сбросить фильтры</app-button>
              <app-button to="/onboarding/1" variant="line" sm>Изменить профиль</app-button>
            </div>
          </app-tile>

          <section
            v-else-if="state.status === 'ready'"
            aria-label="Список мероприятий"
            class="stream [--gap:40px] [--tc:clamp(150px,12.2vw,176px)]"
          >
            <article v-for="(item, i) in visible" :key="item.conference.id" class="st stream-item">
              <sp-stream-label label="Заявки до" :number="deadline(item)" />
              <app-tile
                class="ev"
                :class="
                  i === featured ? 'mint feature p-6 sm:p-10' : ['workshop', 'other'].includes(item.conference.kind) ? 'slate' : ''
                "
                data-rv
              >
                <div class="flex flex-wrap items-center gap-3">
                  <span class="k" :class="{ muted: i !== featured }">{{ meta(item) }}</span>
                  <app-tag v-if="isTrixSource(item.conference)" tone="ink">Заявка через TRIX</app-tag>
                </div>
                <h2 :class="i === featured ? 'd-3' : 'h-34'">
                  <router-link :to="`/c/${item.conference.slug}`">{{ item.conference.name }}</router-link>
                </h2>
                <div v-if="item.topics.length" class="flex flex-wrap gap-2">
                  <app-tag v-for="topic in item.topics" :key="topic">{{ topic }}</app-tag>
                </div>
                <p class="why"><b>Почему подходит</b>{{ item.reason }}</p>
                <div class="ev-foot">
                  <span class="mr-auto">
                    <app-tag :tone="item.conference.is_paid === null ? 'dash' : null">{{
                      paidLabel(item.conference.is_paid)
                    }}</app-tag>
                  </span>
                  <template v-if="isTrixSource(item.conference)">
                    <app-button sm :to="`/c/${item.conference.slug}`" :variant="i === featured ? 'ink' : 'line'">
                      Подать заявку<ArrowRight />
                    </app-button>
                  </template>
                  <template v-else>
                    <app-tag tone="dash">Из открытых источников</app-tag>
                    <app-button
                      v-if="item.conference.website_url"
                      variant="line"
                      sm
                      :href="item.conference.website_url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Подать на сайте<span class="sr"> (сайт организатора)</span><ExternalLink />
                    </app-button>
                  </template>
                  <router-link :to="{ name: 'talks.new', query: { event: item.conference.slug } }" class="k ln">
                    Подготовить доклад
                  </router-link>
                </div>
              </app-tile>
            </article>
          </section>
        </div>

        <aside class="flex min-w-0 flex-[1_1_340px] flex-col gap-4 lg:sticky lg:top-24">
          <app-tile tone="ink" class="flex flex-col gap-5" data-rv>
            <div class="flex items-center gap-3.5">
              <span class="ava mint">{{ initials }}</span>
              <h2 class="h-24">Ваш профиль</h2>
            </div>
            <dl class="dl small [grid-template-columns:110px_1fr]">
              <template v-for="row in profileRows" :key="row.label">
                <dt>{{ row.label }}</dt>
                <dd class="m-0">{{ row.value }}</dd>
              </template>
            </dl>
            <router-link to="/onboarding/1" class="k ln self-start">Изменить профиль</router-link>
          </app-tile>
          <app-tile tone="uv" class="flex flex-col gap-3.5" data-rv>
            <span class="k">Развитие</span>
            <h2 class="h-24">Пока не готовы выступать?</h2>
            <p class="small muted">Подберём площадки для старта и материалы для прокачки.</p>
            <app-button to="/onboarding/1" variant="mint" sm class="mt-1.5 self-start"
              >Уточнить цель<ArrowRight /></app-button
            >
          </app-tile>
          <p class="small muted px-2">
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
import AppButton from '@/components/AppButton.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppPick from '@/components/AppPick.vue'
import AppTag from '@/components/AppTag.vue'
import AppTicker from '@/components/AppTicker.vue'
import AppTile from '@/components/AppTile.vue'
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
