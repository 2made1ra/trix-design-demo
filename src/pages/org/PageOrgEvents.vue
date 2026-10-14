<template>
  <sp-page side="co">
    <div ref="root" class="flex flex-1 flex-col">
      <app-header variant="org" />

      <main class="wrap wide">
        <div class="head" data-rv>
          <div class="flex min-w-0 flex-col gap-4">
            <h1 class="d-1">Мероприятия</h1>
            <p class="deck max-w-180 text-[20px]">
              Мероприятия, на которые вы зовёте своих спикеров. Откройте мероприятие и выберите, кого пригласить
              выступить.
            </p>
          </div>
          <div class="add">
            <button
              type="button"
              class="b b-line"
              :aria-expanded="adding"
              aria-controls="add-event"
              @click="adding = !adding"
            >
              <PlusIcon />Добавить мероприятие по ссылке
            </button>
            <span class="small muted">Вставьте ссылку на программу или лендинг, остальное заполним сами</span>
          </div>
        </div>

        <app-tile
          v-if="adding"
          as="form"
          tone="slate"
          class="flex flex-wrap items-end gap-3"
          id="add-event"
          novalidate
          @submit.prevent="add"
        >
          <app-field
            id="event-url"
            v-model="url"
            class="min-w-70 flex-1"
            label="Ссылка на мероприятие"
            type="url"
            autocomplete="off"
            placeholder="https://timepad.ru/event/go-meetup"
            :error="addError"
          />
          <button type="submit" class="b b-mint" :disabled="saving">Добавить</button>
        </app-tile>

        <p v-if="state.kind === 'loading'" class="muted" role="status">Загружаем мероприятия…</p>
        <div v-else-if="state.kind === 'error'" class="flex flex-col items-start gap-4" role="alert">
          <p>Не удалось загрузить мероприятия.</p>
          <button type="button" class="b b-line" @click="load">Попробовать снова</button>
        </div>

        <section
          v-else-if="!state.upcoming.length && !state.past.length"
          class="emp"
          aria-labelledby="empty-title"
          data-rv
        >
          <span class="k muted">Мероприятия</span>
          <h2 id="empty-title" class="h-34">Мероприятий пока нет</h2>
          <p class="deck text-[20px]">
            Добавьте по ссылке на программу или лендинг. Мероприятие появится здесь, и можно будет выбрать, кого
            позвать.
          </p>
          <button type="button" class="b b-mint" @click="adding = true">
            <PlusIcon />Добавить мероприятие по ссылке
          </button>
        </section>

        <template v-else>
          <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3" data-rv>
            <fieldset class="seg" aria-label="Период">
              <button type="button" :aria-pressed="tab === 'upcoming'" @click="tab = 'upcoming'">Предстоящие</button>
              <button type="button" :aria-pressed="tab === 'past'" @click="tab = 'past'">Прошедшие</button>
            </fieldset>
            <span class="small muted"
              >{{ shown.length }} {{ plural(shown.length, 'мероприятие', 'мероприятия', 'мероприятий') }}</span
            >
          </div>

          <app-tile v-if="!shown.length" as="p" tone="slate" role="status">Здесь пока ничего нет.</app-tile>
          <ul v-else class="evs" aria-label="Список мероприятий">
            <app-tile v-for="event in shown" :key="event.id" as="li" tone="slate" class="ev" data-rv>
              <div class="ev-main">
                <div class="ev-top">
                  <span class="tag" :class="event.source === 'own' ? 'lime' : 'dash'">{{
                    event.source === 'own' ? 'Своё' : 'Открытое'
                  }}</span>
                  <span class="k muted">{{ event.kind }} · {{ event.city }} · {{ formatNames[event.format] }}</span>
                </div>
                <h2 class="h-34">
                  <router-link v-if="tab === 'upcoming'" :to="inviteLink(event)">{{ event.name }}</router-link>
                  <template v-else>{{ event.name }}</template>
                </h2>
                <dl class="ev-meta">
                  <div>
                    <dt class="k muted">Дата</dt>
                    <dd>{{ formatDate(event.starts_at) }}</dd>
                  </div>
                  <div>
                    <dt class="k muted">{{ tab === 'upcoming' ? 'Дедлайн заявок' : 'Приём заявок' }}</dt>
                    <dd>
                      <span v-if="tab === 'upcoming'" class="tag mint">{{ formatDate(event.deadline) }}</span>
                      <span v-else class="tag dash">Закрыт</span>
                    </dd>
                  </div>
                </dl>
                <ul v-if="event.tracks.length" class="trk" aria-label="Треки">
                  <li v-for="track in event.tracks" :key="track" class="tag">{{ track }}</li>
                </ul>
              </div>
              <div class="ev-act">
                <span class="cnt">
                  <span class="num">{{ event.offers_count }}</span>
                  <span class="small muted">Предложено спикерам</span>
                </span>
                <router-link v-if="tab === 'upcoming'" :to="inviteLink(event)" class="b b-mint">
                  Кого позвать<ArrowRightIcon />
                </router-link>
              </div>
            </app-tile>
          </ul>
        </template>
      </main>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRightIcon, PlusIcon } from '@lucide/vue'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { toast } from 'vue-sonner'
import { addOrgEvent, listOrgEvents, type OrgEvent } from '@/api/demo'
import AppField from '@/components/AppField.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppTile from '@/components/AppTile.vue'
import { formatDate, formatNames } from '@/components/org/eventLabels'
import { plural } from '@/components/org/format'
import SpPage from '@/components/speaker/SpPage.vue'
import { useFx } from '@/composables/useFx'

type State = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; upcoming: OrgEvent[]; past: OrgEvent[] }

const root = useTemplateRef<HTMLElement>('root')
const state = ref<State>({ kind: 'loading' })
const tab = ref<'upcoming' | 'past'>('upcoming')
const adding = ref(false)
const url = ref('')
const addError = ref('')
const saving = ref(false)

const load = async () => {
  state.value = { kind: 'loading' }
  const res = await listOrgEvents()
  state.value = res.status === 200 ? { kind: 'ready', ...res.data } : { kind: 'error' }
}
onMounted(load)

const shown = computed(() => (state.value.kind === 'ready' ? state.value[tab.value] : []))
const inviteLink = (event: OrgEvent) => ({ name: 'org.events.invite', params: { id: event.id } })

const add = async () => {
  const value = url.value.trim()
  try {
    new URL(value)
  } catch {
    addError.value = 'Вставьте ссылку целиком, вместе с https://'
    return
  }
  addError.value = ''
  saving.value = true
  const res = await addOrgEvent({ url: value })
  saving.value = false
  if (res.status !== 201) {
    addError.value = res.data.message
    return
  }
  toast.success(`Мероприятие «${res.data.name}» добавлено`)
  url.value = ''
  adding.value = false
  tab.value = 'upcoming'
  await load()
}

useFx(root, { words: 'landing', ink: true, fade: 0 })
</script>
