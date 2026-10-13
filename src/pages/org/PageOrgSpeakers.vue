<template>
  <org-page>
    <div class="flex flex-col gap-4" data-rv>
      <span class="kicker text-ink-2">Кабинет организации</span>
      <h1 class="shout text-d1">Спикеры</h1>
      <p class="max-w-180 text-xl leading-[1.55] text-ink-2">
        Все спикеры организации в одном окне: кто, где и как выступил. Оценки зала видны только вам и самому спикеру.
      </p>
    </div>

    <p v-if="state.kind === 'loading'" class="text-ink-2" role="status">Загружаем спикеров…</p>
    <div v-else-if="state.kind === 'error'" class="flex flex-col items-start gap-4" role="alert">
      <p>Не удалось загрузить спикеров.</p>
      <org-button variant="line" @click="load">Попробовать снова</org-button>
    </div>

    <section
      v-else-if="state.empty"
      class="tile tile-slate flex flex-col items-start gap-5 p-10"
      aria-labelledby="empty-title"
      aria-live="polite"
    >
      <span class="tag tag-dash">Пока пусто</span>
      <h2 id="empty-title" class="shout text-d3 max-w-200">
        Спикеров пока нет: загрузите Excel или отправьте ссылку-приглашение
      </h2>
      <p class="text-ink-2">Спикер принимает приглашение сам, и только после этого вы видите его выступления.</p>
      <div class="flex flex-wrap gap-3">
        <org-button :to="{ path: '/org/onboarding/3' }">Загрузить Excel<ArrowRightIcon /></org-button>
        <org-button variant="line" @click="copyLink">{{
          copied ? 'Ссылка скопирована' : 'Скопировать ссылку-приглашение'
        }}</org-button>
      </div>
    </section>

    <template v-else>
      <section v-if="talk" id="new" class="tile surface-lime flex flex-col gap-6" aria-labelledby="new-title" data-rv>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 id="new-title" class="kicker">
            Новые выступления · {{ state.pending.length }}
            {{ plural(state.pending.length, 'ждёт', 'ждут', 'ждут') }} подтверждения
          </h2>
          <button
            v-if="state.pending.length > 1"
            type="button"
            class="text-sm font-semibold shadow-[inset_0_-1px_0_currentColor]"
            @click="nextTalk"
          >
            Ещё {{ state.pending.length - 1 }}
          </button>
        </div>
        <div class="grid gap-x-12 gap-y-6 md:grid-cols-2">
          <div class="flex min-w-0 flex-col gap-3">
            <div class="flex items-center gap-3">
              <org-avatar :name="talk.speaker.name" tone="mint" />
              <div class="flex min-w-0 flex-col">
                <b>{{ talk.speaker.name }}</b>
                <span class="text-sm opacity-70">{{ talk.speaker.position }}</span>
              </div>
            </div>
            <p class="text-2xl leading-[1.1] font-bold">{{ talk.title }}</p>
            <p class="text-sm opacity-70">{{ talk.kind }} · {{ formatDate(talk.date) }}</p>
            <a
              :href="talk.url"
              class="self-start text-sm font-semibold shadow-[inset_0_-1px_0_currentColor]"
              target="_blank"
              rel="noreferrer"
              >Ссылка на программу</a
            >
          </div>
          <div class="flex flex-col gap-6">
            <fieldset class="flex flex-wrap gap-2" aria-describedby="rate-hint">
              <legend class="org-label mb-2.5">Оценка команды, 1–5</legend>
              <label v-for="n in 5" :key="n" class="pick">
                <input v-model="score" type="radio" name="rate" :value="n">{{ n }}
              </label>
            </fieldset>
            <p id="rate-hint" class="-mt-3 text-[13px] opacity-70">1 — слабо, 5 — сильно. Спикер оценку не видит.</p>
            <label class="flex cursor-pointer items-center gap-3.5">
              <input v-model="recommend" type="checkbox" role="switch" :aria-checked="recommend" class="peer sr-only">
              <span
                class="relative h-7 w-12 flex-none rounded-full shadow-[inset_0_0_0_1px_currentColor] transition-colors after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-current after:transition-transform peer-checked:bg-[#131313] peer-checked:after:translate-x-5 peer-checked:after:bg-l-mint peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                aria-hidden="true"
              />
              <span class="flex flex-col"
                ><b>Рекомендую</b><span class="text-sm opacity-70">Сигнал, кого звать на большие сцены</span></span
              >
            </label>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <p
            class="text-sm opacity-70"
            :class="confirmError && 'font-semibold opacity-100'"
            :role="confirmError ? 'alert' : undefined"
          >
            {{ confirmError || 'Подтверждённое выступление засчитывается спикеру.' }}
          </p>
          <org-button :disabled="confirming" @click="confirm">Подтвердить<ArrowRightIcon /></org-button>
        </div>
      </section>

      <section aria-label="Фильтры" data-rv>
        <form class="grid items-end gap-4 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]" @submit.prevent>
          <div class="flex flex-col gap-2.5 sm:col-span-2">
            <label for="q" class="org-label">Поиск</label>
            <input id="q" v-model="filters.q" class="org-inp" type="search" placeholder="Имя или должность">
          </div>
          <div class="flex flex-col gap-2.5">
            <label for="f-dir" class="org-label">Направление</label>
            <select id="f-dir" v-model="filters.direction_id" class="org-inp">
              <option value="">Все</option>
              <option v-for="item in state.directions" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-2.5">
            <label for="f-city" class="org-label">Город</label>
            <select id="f-city" v-model="filters.city_id" class="org-inp">
              <option value="">Все</option>
              <option v-for="item in state.cities" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-2.5">
            <label for="f-lvl" class="org-label">Уровень</label>
            <select id="f-lvl" v-model="filters.level" class="org-inp">
              <option value="">Любой</option>
              <option v-for="item in levelOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-2.5">
            <label for="f-nps" class="org-label">NPS зала, от</label>
            <input
              id="f-nps"
              v-model="filters.nps_min"
              class="org-inp"
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="0"
            >
          </div>
          <div class="flex flex-col gap-2.5">
            <label for="f-cnt" class="org-label">Выступлений, от</label>
            <input id="f-cnt" v-model="filters.talks_min" class="org-inp" type="number" min="0" placeholder="0">
          </div>
        </form>
      </section>

      <section class="flex flex-col gap-5" aria-label="Список спикеров">
        <div class="flex flex-wrap items-center justify-between gap-4" data-rv>
          <p class="text-sm text-ink-2" aria-live="polite">Показано {{ state.items.length }} из {{ state.all }}</p>
          <fieldset class="org-seg m-0 border-0" aria-label="Вид списка">
            <button type="button" :aria-pressed="view === 'table'" @click="view = 'table'">Таблица</button>
            <button type="button" :aria-pressed="view === 'city'" @click="view = 'city'">По городам</button>
          </fieldset>
        </div>

        <p v-if="!state.items.length" class="tile tile-slate" role="status">
          Никого не нашли: смягчите фильтры или очистите поиск.
        </p>
        <section
          v-else-if="view === 'table'"
          class="overflow-x-auto rounded-[18px] shadow-[inset_0_0_0_1px_var(--line)]"
          :class="{ 'opacity-60': state.refreshing }"
          :tabindex="0"
          aria-label="Таблица спикеров"
          data-rv
        >
          <table class="org-tbl w-full min-w-250 border-collapse text-left">
            <caption class="sr-only">
              Спикеры организации
            </caption>
            <thead>
              <tr>
                <th scope="col">Спикер</th>
                <th scope="col">Направление</th>
                <th scope="col">Город</th>
                <th scope="col">Уровень</th>
                <th scope="col" class="text-right">Выступлений</th>
                <th scope="col" class="text-right">NPS зала</th>
                <th scope="col">Рекомендую</th>
                <th scope="col">Статус</th>
                <th scope="col"><span class="sr-only">Действие</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in state.items" :key="item.id" class="align-middle">
                <td>
                  <div class="flex items-center gap-3">
                    <org-avatar :name="item.name" :tone="item.status === 'active' ? 'mint' : 'plain'" small />
                    <div class="flex min-w-0 flex-col">
                      <b class="font-semibold">{{ item.name }}</b>
                      <span class="text-sm text-ink-2">{{ item.position }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ item.direction.name }}</td>
                <td>{{ item.city.name }}</td>
                <td>{{ item.level ? levelNames[item.level] : '—' }}</td>
                <td class="text-right font-mono">{{ item.status === 'active' ? item.talks_count : '—' }}</td>
                <td class="text-right font-mono">{{ item.nps ?? '—' }}</td>
                <td>
                  <span v-if="item.recommended" class="tag fill-ink">Рекомендую</span>
                  <span v-else class="text-ink-2"
                    ><span aria-hidden="true">—</span><span class="sr-only">Не рекомендован</span></span
                  >
                </td>
                <td>
                  <span class="tag" :class="item.status === 'active' ? 'fill-mint' : 'tag-dash'">{{
                    item.status === 'active' ? 'Активен' : 'Приглашён'
                  }}</span>
                </td>
                <td><org-button variant="line" size="sm" :to="offerLink(item.id)">Предложить выступить</org-button></td>
              </tr>
            </tbody>
          </table>
        </section>

        <ul
          v-else
          class="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]"
          aria-label="Спикеры по городам"
          data-rv
        >
          <li v-for="group in byCity" :key="group.city" class="tile tile-slate flex flex-col gap-4">
            <div class="flex items-baseline justify-between gap-3">
              <h3 class="text-2xl leading-[1.1] font-bold">{{ group.city }}</h3>
              <span class="kicker text-ink-2"
                >{{ group.items.length }} {{ plural(group.items.length, 'спикер', 'спикера', 'спикеров') }}</span
              >
            </div>
            <ul class="flex flex-col">
              <li
                v-for="item in group.items"
                :key="item.id"
                class="flex items-center justify-between gap-3 py-3 shadow-[inset_0_1px_0_var(--line-2)]"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <org-avatar :name="item.name" :tone="item.status === 'active' ? 'mint' : 'plain'" small />
                  <div class="flex min-w-0 flex-col">
                    <b class="truncate font-semibold">{{ item.name }}</b>
                    <span class="text-sm text-ink-2"
                      >{{ item.direction.name }}{{ item.level ? ` · ${levelNames[item.level]}` : '' }}</span
                    >
                  </div>
                </div>
                <span class="flex flex-none items-center gap-2">
                  <span v-if="item.recommended" class="tag fill-ink">Рекомендую</span>
                  <span v-if="item.status === 'invited'" class="tag tag-dash">Приглашён</span>
                  <span v-else class="font-mono">{{ item.nps }}</span>
                </span>
              </li>
            </ul>
          </li>
        </ul>

        <p class="text-sm text-ink-2">
          «Выступлений» — только подтверждённые. У приглашённых оценок пока нет: они появятся после первого
          подтверждённого выступления.
        </p>
      </section>
    </template>
  </org-page>
</template>

<script setup lang="ts">
import { ArrowRightIcon } from '@lucide/vue'
import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  confirmPendingTalk,
  listOrgEvents,
  listOrgSpeakers,
  listPendingTalks,
  type OrgSpeaker,
  type OrgSpeakersParams,
  type PendingTalk,
} from '@/api/demo'
import {
  type City,
  listCities,
  listPositionCategories,
  type PositionCategory,
  type PositionLevel,
} from '@/api/generated'
import { plural } from '@/components/org/format'
import { levelNames, levelOptions } from '@/components/org/levels'
import OrgAvatar from '@/components/org/OrgAvatar.vue'
import OrgButton from '@/components/org/OrgButton.vue'
import OrgPage from '@/components/org/OrgPage.vue'

type State =
  | { kind: 'loading' }
  | { kind: 'error' }
  | {
      kind: 'ready'
      items: OrgSpeaker[]
      /** Всего спикеров без фильтров: по нему различаем «пусто» и «ничего не нашли» */
      all: number
      empty: boolean
      refreshing: boolean
      pending: PendingTalk[]
      directions: PositionCategory[]
      cities: City[]
    }

const state = ref<State>({ kind: 'loading' })
const view = ref<'table' | 'city'>('table')
const nextEventId = ref<string | null>(null)
const copied = ref(false)

const filters = reactive({
  q: '',
  direction_id: '',
  city_id: '',
  level: '' as PositionLevel | '',
  nps_min: '',
  talks_min: '',
})
const params = (): OrgSpeakersParams => ({
  q: filters.q.trim() || undefined,
  direction_id: filters.direction_id || undefined,
  city_id: filters.city_id || undefined,
  level: filters.level || undefined,
  nps_min: filters.nps_min === '' ? undefined : Number(filters.nps_min),
  talks_min: filters.talks_min === '' ? undefined : Number(filters.talks_min),
})
const filtered = () => Object.values(params()).some((value) => value !== undefined)

const load = async () => {
  state.value = { kind: 'loading' }
  const [speakers, pending, directions, cities, events] = await Promise.all([
    listOrgSpeakers(params()),
    listPendingTalks(),
    listPositionCategories(),
    listCities(),
    listOrgEvents(),
  ])
  if (speakers.status !== 200 || pending.status !== 200 || directions.status !== 200 || cities.status !== 200) {
    state.value = { kind: 'error' }
    return
  }
  if (events.status === 200) nextEventId.value = events.data.upcoming[0]?.id ?? null
  state.value = {
    kind: 'ready',
    items: speakers.data.items,
    all: speakers.data.total,
    empty: speakers.data.total === 0 && !filtered(),
    refreshing: false,
    pending: pending.data.items,
    directions: directions.data,
    cities: cities.data,
  }
}

// Номер запроса: ответ устаревшего поиска не перезаписывает свежий.
let search = 0
const refresh = async () => {
  const s = state.value
  if (s.kind !== 'ready') return
  const mine = ++search
  s.refreshing = true
  const res = await listOrgSpeakers(params())
  if (mine !== search || state.value.kind !== 'ready') return
  state.value.refreshing = false
  if (res.status !== 200) return void toast.error(res.data.message)
  state.value.items = res.data.items
  if (!filtered()) state.value.all = res.data.total
}

onMounted(load)
watchDebounced(filters, refresh, { debounce: 300, deep: true })

const talk = computed(() => {
  const s = state.value
  return s.kind === 'ready' ? s.pending[0] : undefined
})
const score = ref<1 | 2 | 3 | 4 | 5 | null>(null)
const recommend = ref(false)
const confirming = ref(false)
const confirmError = ref('')

const nextTalk = () => {
  const s = state.value
  if (s.kind === 'ready') s.pending.push(s.pending.shift() as PendingTalk)
  score.value = null
  recommend.value = false
}

const confirm = async () => {
  const s = state.value
  if (s.kind !== 'ready' || !talk.value) return
  if (!score.value) {
    confirmError.value = 'Поставьте оценку от 1 до 5'
    return
  }
  confirmError.value = ''
  confirming.value = true
  const res = await confirmPendingTalk(talk.value.id, { score: score.value, recommend: recommend.value })
  confirming.value = false
  if (res.status !== 200) return void toast.error(res.data.message)
  toast.success('Выступление засчитано спикеру')
  s.pending.shift()
  score.value = null
  recommend.value = false
  await refresh()
}

const byCity = computed(() => {
  const s = state.value
  if (s.kind !== 'ready') return []
  const groups = new Map<string, OrgSpeaker[]>()
  for (const item of s.items) groups.set(item.city.name, [...(groups.get(item.city.name) ?? []), item])
  return [...groups].map(([city, items]) => ({ city, items })).sort((a, b) => a.city.localeCompare(b.city, 'ru'))
})

// Предложение уходит на ближайшее предстоящее мероприятие, без него — на список мероприятий.
const offerLink = (speakerId: string) =>
  nextEventId.value
    ? { name: 'org.events.invite', params: { id: nextEventId.value }, query: { speaker: speakerId } }
    : { name: 'org.events' }

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/register`)
  } catch {
    // Буфер недоступен: ссылка всё равно показана в подтверждении
  }
  copied.value = true
  toast.success('Ссылка-приглашение скопирована')
}
</script>
