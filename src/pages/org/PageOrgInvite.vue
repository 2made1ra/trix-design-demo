<template>
  <sp-page side="co">
    <div ref="root" class="flex flex-1 flex-col">
      <app-header variant="org" />

      <main class="wrap wide">
        <p v-if="state.kind === 'loading'" class="muted" role="status">Подбираем спикеров…</p>
        <div v-else-if="state.kind === 'error'" class="flex flex-col items-start gap-4" role="alert">
          <p>{{ state.message }}</p>
          <div class="flex flex-wrap gap-3">
            <app-button variant="line" @click="load">Попробовать снова</app-button>
            <app-button :to="{ name: 'org.events' }" variant="line">К мероприятиям</app-button>
          </div>
        </div>

        <template v-else>
          <div class="flex flex-col gap-5" data-rv>
            <nav class="crumbs small" aria-label="Путь">
              <router-link :to="{ name: 'org.events' }">Мероприятия</router-link>
              <span aria-hidden="true">/</span>
              <span>{{ state.event.name }}</span>
            </nav>
            <h1 class="d-1">Кого позвать</h1>
            <p class="deck max-w-190 text-[20px]">
              Спикеры вашей организации, которые подходят этому мероприятию. Решение и приглашение остаются за вами.
            </p>
          </div>

          <app-tile as="section" tone="ink" class="dead" aria-label="Мероприятие" data-rv>
            <div class="flex min-w-0 flex-col gap-2.5">
              <span class="k muted">Мероприятие · {{ state.event.city }}</span>
              <h2 class="h-34">{{ state.event.name }}</h2>
            </div>
            <dl>
              <div v-if="state.event.tracks.length">
                <dt class="k muted">{{ state.event.tracks.length > 1 ? 'Треки' : 'Трек' }}</dt>
                <dd>{{ state.event.tracks.join(', ') }}</dd>
              </div>
              <div>
                <dt class="k muted">Уровень</dt>
                <dd>{{ state.event.min_level ? `${levelNames[state.event.min_level]} и выше` : 'Любой' }}</dd>
              </div>
              <div>
                <dt class="k muted">Дедлайн заявок</dt>
                <dd><app-tag tone="mint">{{ formatDate(state.event.deadline) }}</app-tag></dd>
              </div>
            </dl>
          </app-tile>

          <section class="flex flex-col gap-5" aria-labelledby="cand-title">
            <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2" data-rv>
              <h2 id="cand-title" class="h-34">
                {{
                  state.items.length
                    ? `Подходят ${state.items.length} ${plural(state.items.length, 'спикер', 'спикера', 'спикеров')}`
                    : 'Подходящих спикеров пока нет'
                }}
              </h2>
              <span class="small muted">По теме трека, уровню и NPS</span>
            </div>

            <app-tile v-if="!state.items.length" as="p" tone="slate" role="status">
              Под это мероприятие никто не подошёл. Загрузите больше спикеров или выберите другое мероприятие.
            </app-tile>
            <ul v-else class="cand" aria-label="Кандидаты">
              <app-tile
                v-for="item in state.items"
                :key="item.speaker.id"
                as="li"
                tone="slate"
                class="cd"
                :class="{ sel: dialog?.id === item.speaker.id }"
                data-rv
              >
                <div class="cd-top">
                  <div class="person">
                    <span class="ava" :class="toneOf(item.speaker.name)" aria-hidden="true">{{
                      initials(item.speaker.name)
                    }}</span>
                    <div class="cell">
                      <h3 class="h-24">{{ item.speaker.name }}</h3>
                      <span class="small muted">{{ item.speaker.direction.name }} · {{ item.speaker.city.name }}</span>
                    </div>
                  </div>
                  <app-tag v-if="item.speaker.recommended" tone="ink">Рекомендую</app-tag>
                </div>
                <dl class="stats">
                  <div>
                    <dt class="k muted">Выступлений</dt>
                    <dd class="num">{{ item.speaker.talks_count }}</dd>
                  </div>
                  <div>
                    <dt class="k muted">NPS зала</dt>
                    <dd class="num">{{ formatNps(item.speaker.nps) }}</dd>
                  </div>
                </dl>
                <p class="why">
                  <b>Почему подходит</b><span>{{ item.reason }}</span>
                </p>
                <div class="cd-act">
                  <span v-if="item.offer" class="sent">
                    <app-tag tone="mint">Предложение отправлено</app-tag>
                    <span class="small muted">{{ formatDate(item.offer.sent_at) }}</span>
                  </span>
                  <app-button
                    v-else
                    variant="mint"
                    sm
                    :aria-label="`Предложить выступить: ${item.speaker.name}`"
                    @click="openOffer(item.speaker)"
                  >
                    Предложить выступить
                  </app-button>
                </div>
              </app-tile>
            </ul>

            <p class="small muted max-w-180" data-rv>
              Кандидаты — только спикеры вашей организации. Разбор докладов спикеров команда не видит: подбор строится
              на выступлениях, уровне и оценках зала.
            </p>
          </section>
        </template>
      </main>
    </div>

    <org-offer-dialog
      v-if="dialog && state.kind === 'ready'"
      :event="state.event"
      :speaker="dialog"
      @close="closeOffer"
      @sent="onSent"
    />
  </sp-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  type Candidate,
  listEventCandidates,
  listOrgSpeakers,
  type Offer,
  type OrgEvent,
  type OrgSpeaker,
} from '@/api/demo'
import AppButton from '@/components/AppButton.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppTag from '@/components/AppTag.vue'
import AppTile from '@/components/AppTile.vue'
import { formatDate } from '@/components/org/eventLabels'
import { formatNps, initials, plural } from '@/components/org/format'
import { levelNames, toneOf } from '@/components/org/levels'
import OrgOfferDialog from '@/components/org/OrgOfferDialog.vue'
import SpPage from '@/components/speaker/SpPage.vue'
import { useFx } from '@/composables/useFx'

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; event: OrgEvent; items: Candidate[] }

const root = useTemplateRef<HTMLElement>('root')
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

useFx(root, { words: 'landing', ink: true, fade: 0 })
</script>
