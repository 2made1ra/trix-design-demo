<template>
  <sp-page side="co">
    <div ref="root" class="flex flex-1 flex-col">
      <app-header variant="org" />

      <main class="wrap wide pt-16">
        <div class="flex flex-col gap-4" data-rv>
          <span class="k muted">Кабинет организации</span>
          <h1 class="d-1">Спикеры</h1>
          <p class="deck max-w-180 text-[20px]">
            Все спикеры организации в одном окне: кто, где и как выступил. Оценки зала видны только вам и самому
            спикеру.
          </p>
        </div>

        <p v-if="state.kind === 'loading'" class="muted" role="status">Загружаем спикеров…</p>
        <div v-else-if="state.kind === 'error'" class="flex flex-col items-start gap-4" role="alert">
          <p>Не удалось загрузить спикеров.</p>
          <button type="button" class="b b-line" @click="load">Попробовать снова</button>
        </div>

        <section v-else-if="state.empty" class="tile slate" aria-labelledby="empty-title" aria-live="polite" data-rv>
          <div class="emp">
            <span class="tag dash">Пока пусто</span>
            <h2 id="empty-title" class="h-34">Спикеров пока нет: загрузите Excel или отправьте ссылку-приглашение</h2>
            <p class="muted">Спикер принимает приглашение сам, и только после этого вы видите его выступления.</p>
            <div class="flex flex-wrap gap-3">
              <router-link :to="{ path: '/org/onboarding/3' }" class="b b-mint">
                Загрузить Excel<ArrowRightIcon />
              </router-link>
              <button type="button" class="b b-line" @click="copyLink">
                {{ copied ? 'Ссылка скопирована' : 'Скопировать ссылку-приглашение' }}
              </button>
            </div>
          </div>
        </section>

        <template v-else>
          <section v-if="talk" id="new" class="tile lime strip" aria-labelledby="np-title" data-rv>
            <div class="strip-top">
              <h2 id="np-title" class="k">
                Новые выступления · {{ state.pending.length }}
                {{ plural(state.pending.length, 'ждёт', 'ждут', 'ждут') }} подтверждения
              </h2>
              <button v-if="state.pending.length > 1" type="button" class="ln small font-semibold" @click="nextTalk">
                Ещё {{ state.pending.length - 1 }}
              </button>
            </div>
            <div class="np">
              <div>
                <div class="person">
                  <span class="ava mint" aria-hidden="true">{{ initials(talk.speaker.name) }}</span>
                  <div class="cell">
                    <b>{{ talk.speaker.name }}</b>
                    <span class="small muted">{{ talk.speaker.position }}</span>
                  </div>
                </div>
                <p class="h-24">{{ talk.title }}</p>
                <p class="small muted">{{ talk.kind }} · {{ formatDate(talk.date) }}</p>
                <a :href="talk.url" class="ln small self-start font-semibold" target="_blank" rel="noreferrer">
                  Ссылка на программу
                </a>
              </div>
              <div class="gap-6">
                <fieldset class="rate" aria-describedby="rate-hint">
                  <legend class="legend mb-2.5">Оценка команды, 1–5</legend>
                  <app-pick v-for="n in 5" :key="n" v-model="score" type="radio" name="rate" :value="n">
                    {{ n }}
                  </app-pick>
                </fieldset>
                <p id="rate-hint" class="hint -mt-2">1 — слабо, 5 — сильно. Спикер оценку не видит.</p>
                <label class="swt">
                  <input v-model="recommend" type="checkbox" role="switch" :aria-checked="recommend">
                  <span class="tr" aria-hidden="true" />
                  <span class="tx">
                    <b>Рекомендую</b>
                    <span class="small muted">Сигнал, кого звать на большие сцены</span>
                  </span>
                </label>
              </div>
            </div>
            <div class="strip-bot">
              <p
                class="small muted"
                :class="{ 'font-semibold': confirmError }"
                :role="confirmError ? 'alert' : undefined"
              >
                {{ confirmError || 'Подтверждённое выступление засчитывается спикеру.' }}
              </p>
              <button type="button" class="b b-mint" :disabled="confirming" @click="confirm">
                Подтвердить<CheckIcon />
              </button>
            </div>
          </section>

          <section aria-label="Фильтры" data-rv>
            <form class="filters" @submit.prevent>
              <div class="field wide2">
                <label for="q">Поиск</label>
                <input id="q" v-model="filters.q" class="inp" type="search" placeholder="Имя или должность">
              </div>
              <div class="field">
                <label for="f-dir">Направление</label>
                <div class="combo">
                  <select id="f-dir" v-model="filters.direction_id" class="inp">
                    <option value="">Все</option>
                    <option v-for="item in state.directions" :key="item.id" :value="item.id">{{ item.name }}</option>
                  </select>
                  <ChevronDownIcon aria-hidden="true" />
                </div>
              </div>
              <div class="field">
                <label for="f-city">Город</label>
                <div class="combo">
                  <select id="f-city" v-model="filters.city_id" class="inp">
                    <option value="">Все</option>
                    <option v-for="item in state.cities" :key="item.id" :value="item.id">{{ item.name }}</option>
                  </select>
                  <ChevronDownIcon aria-hidden="true" />
                </div>
              </div>
              <div class="field">
                <label for="f-lvl">Уровень</label>
                <div class="combo">
                  <select id="f-lvl" v-model="filters.level" class="inp">
                    <option value="">Любой</option>
                    <option v-for="item in levelOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
                  </select>
                  <ChevronDownIcon aria-hidden="true" />
                </div>
              </div>
              <div class="field">
                <label for="f-nps">NPS зала, от</label>
                <input
                  id="f-nps"
                  v-model="filters.nps_min"
                  class="inp"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="0"
                >
              </div>
              <div class="field">
                <label for="f-cnt">Выступлений, от</label>
                <input id="f-cnt" v-model="filters.talks_min" class="inp" type="number" min="0" placeholder="0">
              </div>
            </form>
          </section>

          <section class="flex flex-col gap-5" aria-label="Список спикеров">
            <div class="bar" data-rv>
              <p class="small muted" aria-live="polite">Показано {{ state.items.length }} из {{ state.all }}</p>
              <fieldset class="seg" aria-label="Вид списка">
                <button type="button" :aria-pressed="view === 'table'" @click="view = 'table'">Таблица</button>
                <button type="button" :aria-pressed="view === 'city'" @click="view = 'city'">По городам</button>
              </fieldset>
            </div>

            <p v-if="!state.items.length" class="tile slate" role="status">
              Никого не нашли: смягчите фильтры или очистите поиск.
            </p>
            <section
              v-else-if="view === 'table'"
              class="tbox"
              :class="{ 'opacity-60': state.refreshing }"
              :tabindex="0"
              aria-label="Таблица спикеров"
              data-rv
            >
              <table class="sp">
                <caption class="sr">
                  Спикеры организации
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Спикер</th>
                    <th scope="col">Направление</th>
                    <th scope="col">Город</th>
                    <th scope="col">Уровень</th>
                    <th scope="col" class="n">Выступлений</th>
                    <th scope="col" class="n">NPS зала</th>
                    <th scope="col">Рекомендую</th>
                    <th scope="col">Статус</th>
                    <th scope="col"><span class="sr">Действие</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in state.items" :key="item.id">
                    <td>
                      <div class="person">
                        <span class="ava sm" :class="{ mint: item.status === 'active' }" aria-hidden="true">{{
                          initials(item.name)
                        }}</span>
                        <div class="cell">
                          <b>{{ item.name }}</b>
                          <span class="small muted">{{ item.position }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ item.direction.name }}</td>
                    <td>{{ item.city.name }}</td>
                    <td>{{ item.level ? levelNames[item.level] : '—' }}</td>
                    <td class="n num">{{ item.status === 'active' ? item.talks_count : '—' }}</td>
                    <td class="n num">{{ formatNps(item.nps) }}</td>
                    <td>
                      <span v-if="item.recommended" class="tag ink">Рекомендую</span>
                      <span v-else class="muted"
                        ><span aria-hidden="true">—</span><span class="sr">Не рекомендован</span></span
                      >
                    </td>
                    <td>
                      <span class="tag" :class="item.status === 'active' ? 'mint' : 'dash'">{{
                        item.status === 'active' ? 'Активен' : 'Приглашён'
                      }}</span>
                    </td>
                    <td>
                      <router-link :to="offerLink(item.id)" class="b b-line b-sm">Предложить выступить</router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <ul v-else class="cities" aria-label="Спикеры по городам" data-rv>
              <li v-for="group in byCity" :key="group.city" class="tile slate city">
                <div class="flex items-baseline justify-between gap-3">
                  <h3 class="h-24">{{ group.city }}</h3>
                  <span class="k muted"
                    >{{ group.items.length }} {{ plural(group.items.length, 'спикер', 'спикера', 'спикеров') }}</span
                  >
                </div>
                <ul>
                  <li v-for="item in group.items" :key="item.id">
                    <div class="person">
                      <span class="ava sm" :class="{ mint: item.status === 'active' }" aria-hidden="true">{{
                        initials(item.name)
                      }}</span>
                      <div class="cell">
                        <b>{{ item.name }}</b>
                        <span class="small muted"
                          >{{ item.direction.name }}{{ item.level ? ` · ${levelNames[item.level]}` : '' }}</span
                        >
                      </div>
                    </div>
                    <span class="flex items-center gap-2">
                      <span v-if="item.recommended" class="tag ink">Рекомендую</span>
                      <span v-if="item.status === 'invited'" class="tag dash">Приглашён</span>
                      <span v-else class="num">{{ formatNps(item.nps) }}</span>
                    </span>
                  </li>
                </ul>
              </li>
            </ul>

            <p class="small muted">
              «Выступлений» — только подтверждённые. У приглашённых оценок пока нет: они появятся после первого
              подтверждённого выступления.
            </p>
          </section>
        </template>
      </main>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRightIcon, CheckIcon, ChevronDownIcon } from '@lucide/vue'
import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue'
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
import AppHeader from '@/components/AppHeader.vue'
import AppPick from '@/components/AppPick.vue'
import { formatNps, initials, plural } from '@/components/org/format'
import { levelNames, levelOptions } from '@/components/org/levels'
import SpPage from '@/components/speaker/SpPage.vue'
import { useFx } from '@/composables/useFx'

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

const root = useTemplateRef<HTMLElement>('root')
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

useFx(root, { words: 'landing', ink: true, fade: 0 })
</script>
