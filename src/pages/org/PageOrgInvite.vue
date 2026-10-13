<template>
  <org-page>
    <p v-if="state.kind === 'loading'" class="text-ink-2" role="status">Подбираем спикеров…</p>
    <div v-else-if="state.kind === 'error'" class="flex flex-col items-start gap-4" role="alert">
      <p>{{ state.message }}</p>
      <div class="flex flex-wrap gap-3">
        <org-button variant="line" @click="load">Попробовать снова</org-button>
        <org-button variant="line" :to="{ name: 'org.events' }">К мероприятиям</org-button>
      </div>
    </div>

    <template v-else>
      <div class="flex flex-col gap-5" data-rv>
        <nav class="flex flex-wrap items-center gap-2 text-sm text-ink-2" aria-label="Путь">
          <router-link :to="{ name: 'org.events' }" class="shadow-[inset_0_-1px_0_currentColor] hover:text-ink"
            >Мероприятия</router-link
          >
          <span aria-hidden="true">/</span>
          <span>{{ state.event.name }}</span>
        </nav>
        <h1 class="shout text-d1">Кого позвать</h1>
        <p class="max-w-190 text-xl leading-[1.55] text-ink-2">
          Спикеры вашей организации, которые подходят этому мероприятию. Решение и приглашение остаются за вами.
        </p>
      </div>

      <section
        class="tile surface-ink flex flex-wrap items-center justify-between gap-x-10 gap-y-5"
        aria-label="Мероприятие"
        data-rv
      >
        <div class="flex min-w-0 flex-col gap-2.5">
          <span class="kicker opacity-70">Мероприятие · {{ state.event.city }}</span>
          <h2 class="shout text-d3">{{ state.event.name }}</h2>
        </div>
        <dl class="m-0 flex flex-wrap gap-x-10 gap-y-4">
          <div v-if="state.event.tracks.length" class="flex flex-col gap-1.5">
            <dt class="kicker opacity-70">{{ state.event.tracks.length > 1 ? 'Треки' : 'Трек' }}</dt>
            <dd class="m-0 font-semibold">{{ state.event.tracks.join(', ') }}</dd>
          </div>
          <div class="flex flex-col gap-1.5">
            <dt class="kicker opacity-70">Уровень</dt>
            <dd class="m-0 font-semibold">
              {{ state.event.min_level ? `${levelNames[state.event.min_level]} и выше` : 'Любой' }}
            </dd>
          </div>
          <div class="flex flex-col gap-1.5">
            <dt class="kicker opacity-70">Дедлайн заявок</dt>
            <dd class="m-0">
              <span class="tag fill-mint text-[#131313]">{{ formatDate(state.event.deadline) }}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section class="flex flex-col gap-5" aria-labelledby="cand-title">
        <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2" data-rv>
          <h2 id="cand-title" class="shout text-d3">
            {{
              state.items.length
                ? `Подходят ${state.items.length} ${plural(state.items.length, 'спикер', 'спикера', 'спикеров')}`
                : 'Подходящих спикеров пока нет'
            }}
          </h2>
          <span class="text-sm text-ink-2">По теме трека, уровню и NPS</span>
        </div>

        <p v-if="!state.items.length" class="tile tile-slate" role="status">
          Под это мероприятие никто не подошёл. Загрузите больше спикеров или выберите другое мероприятие.
        </p>
        <ul
          v-else
          class="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr))]"
          aria-label="Кандидаты"
        >
          <li v-for="item in state.items" :key="item.speaker.id" class="tile tile-slate flex flex-col gap-6" data-rv>
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 items-center gap-3">
                <org-avatar :name="item.speaker.name" :tone="toneOf(item.speaker.name)" />
                <div class="flex min-w-0 flex-col gap-0.5">
                  <h3 class="text-2xl leading-[1.1] font-bold">{{ item.speaker.name }}</h3>
                  <span class="text-sm text-ink-2"
                    >{{ item.speaker.direction.name }}
                    · {{ item.speaker.city.name }}</span
                  >
                </div>
              </div>
              <span v-if="item.speaker.recommended" class="tag fill-ink">Рекомендую</span>
            </div>
            <dl
              class="m-0 flex flex-wrap gap-x-10 gap-y-3 py-4 shadow-[inset_0_1px_0_var(--line-2),inset_0_-1px_0_var(--line-2)]"
            >
              <div class="flex flex-col gap-1.5">
                <dt class="kicker text-ink-2">Выступлений</dt>
                <dd class="m-0 font-mono text-[22px] font-semibold">{{ item.speaker.talks_count }}</dd>
              </div>
              <div class="flex flex-col gap-1.5">
                <dt class="kicker text-ink-2">NPS зала</dt>
                <dd class="m-0 font-mono text-[22px] font-semibold">{{ item.speaker.nps ?? '—' }}</dd>
              </div>
            </dl>
            <p class="flex flex-col gap-1 text-lg"><b>Почему подходит</b><span>{{ item.reason }}</span></p>
            <div class="mt-auto flex flex-wrap items-center gap-3">
              <span v-if="item.offer" class="inline-flex items-center gap-2.5">
                <span class="tag fill-mint">Предложение отправлено</span>
                <span class="text-sm text-ink-2">{{ formatDate(item.offer.sent_at) }}</span>
              </span>
              <org-button
                v-else
                size="sm"
                :aria-label="`Предложить выступить: ${item.speaker.name}`"
                @click="openOffer(item.speaker)"
              >
                Предложить выступить
              </org-button>
            </div>
          </li>
        </ul>

        <p class="max-w-180 text-sm text-ink-2" data-rv>
          Кандидаты — только спикеры вашей организации. Разбор докладов спикеров команда не видит: подбор строится на
          выступлениях, уровне и оценках зала.
        </p>
      </section>
    </template>

    <org-offer-dialog
      v-if="dialog && state.kind === 'ready'"
      :event="state.event"
      :speaker="dialog"
      @close="closeOffer"
      @sent="onSent"
    />
  </org-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  type Candidate,
  listEventCandidates,
  listOrgSpeakers,
  type Offer,
  type OrgEvent,
  type OrgSpeaker,
} from '@/api/demo'
import { formatDate } from '@/components/org/eventLabels'
import { plural } from '@/components/org/format'
import { levelNames, toneOf } from '@/components/org/levels'
import OrgAvatar from '@/components/org/OrgAvatar.vue'
import OrgButton from '@/components/org/OrgButton.vue'
import OrgOfferDialog from '@/components/org/OrgOfferDialog.vue'
import OrgPage from '@/components/org/OrgPage.vue'

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; event: OrgEvent; items: Candidate[] }

const route = useRoute()
const router = useRouter()
const state = ref<State>({ kind: 'loading' })
const dialog = ref<OrgSpeaker | null>(null)

const eventId = computed(() => String(route.params.id))

const load = async () => {
  state.value = { kind: 'loading' }
  const res = await listEventCandidates(eventId.value)
  if (res.status !== 200) {
    state.value = {
      kind: 'error',
      message: res.status === 404 ? 'Такого мероприятия нет.' : 'Не удалось подобрать спикеров.',
    }
    return
  }
  state.value = { kind: 'ready', ...res.data }
  await openFromQuery()
}

// ?speaker=id открывает окно сразу: так сюда приходят из таблицы спикеров.
const openFromQuery = async () => {
  const id = route.query.speaker
  if (typeof id !== 'string' || state.value.kind !== 'ready') return
  const candidate = state.value.items.find((item) => item.speaker.id === id)
  if (candidate?.offer) return
  // Приглашённого спикера в подборке нет, но предложить ему выступить можно.
  const all = candidate ? null : await listOrgSpeakers()
  const speaker =
    candidate?.speaker ?? (all?.status === 200 ? all.data.items.find((item) => item.id === id) : undefined)
  if (speaker) dialog.value = speaker
}

onMounted(load)
watch(eventId, load)

const openOffer = (speaker: OrgSpeaker) => {
  dialog.value = speaker
}

const closeOffer = () => {
  dialog.value = null
  if (route.query.speaker) router.replace({ query: {} })
}

const onSent = (offer: Offer) => {
  const s = state.value
  if (s.kind !== 'ready') return
  const candidate = s.items.find((item) => item.speaker.id === offer.speaker.id)
  if (candidate) candidate.offer = offer
}
</script>
