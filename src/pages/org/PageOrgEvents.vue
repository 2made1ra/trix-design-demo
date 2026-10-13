<template>
  <org-page>
    <div class="flex flex-wrap items-end justify-between gap-x-10 gap-y-5" data-rv>
      <div class="flex min-w-0 flex-col gap-4">
        <h1 class="shout text-d1">Мероприятия</h1>
        <p class="max-w-180 text-xl leading-[1.55] text-ink-2">
          Мероприятия, на которые вы зовёте своих спикеров. Откройте мероприятие и выберите, кого пригласить выступить.
        </p>
      </div>
      <div class="flex flex-col items-end gap-2 max-md:items-start">
        <org-button variant="line" :aria-expanded="adding" aria-controls="add-event" @click="adding = !adding">
          <PlusIcon />Добавить мероприятие по ссылке
        </org-button>
        <span class="text-sm text-ink-2">Вставьте ссылку на программу или лендинг, остальное заполним сами</span>
      </div>
    </div>

    <form
      v-if="adding"
      id="add-event"
      class="tile tile-slate flex flex-wrap items-end gap-3"
      novalidate
      @submit.prevent="add"
    >
      <div class="flex min-w-70 flex-1 flex-col gap-2.5">
        <label for="event-url" class="org-label">Ссылка на мероприятие</label>
        <input
          id="event-url"
          v-model="url"
          class="org-inp"
          type="url"
          autocomplete="off"
          placeholder="https://timepad.ru/event/go-meetup"
          :aria-invalid="!!addError"
          :aria-describedby="addError ? 'event-url-err' : undefined"
        >
        <p v-if="addError" id="event-url-err" class="org-err" role="alert">{{ addError }}</p>
      </div>
      <org-button type="submit" :disabled="saving">Добавить</org-button>
    </form>

    <p v-if="state.kind === 'loading'" class="text-ink-2" role="status">Загружаем мероприятия…</p>
    <div v-else-if="state.kind === 'error'" class="flex flex-col items-start gap-4" role="alert">
      <p>Не удалось загрузить мероприятия.</p>
      <org-button variant="line" @click="load">Попробовать снова</org-button>
    </div>

    <section
      v-else-if="!state.upcoming.length && !state.past.length"
      class="flex max-w-160 flex-col items-start gap-6"
      aria-labelledby="empty-title"
      data-rv
    >
      <span class="kicker text-ink-2">Мероприятия</span>
      <h2 id="empty-title" class="shout text-d3">Мероприятий пока нет</h2>
      <p class="text-xl leading-[1.55] text-ink-2">
        Добавьте по ссылке на программу или лендинг. Мероприятие появится здесь, и можно будет выбрать, кого позвать.
      </p>
      <org-button @click="adding = true"><PlusIcon />Добавить мероприятие по ссылке</org-button>
    </section>

    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3" data-rv>
        <fieldset class="org-seg m-0 border-0" aria-label="Период">
          <button type="button" :aria-pressed="tab === 'upcoming'" @click="tab = 'upcoming'">Предстоящие</button>
          <button type="button" :aria-pressed="tab === 'past'" @click="tab = 'past'">Прошедшие</button>
        </fieldset>
        <span class="text-sm text-ink-2"
          >{{ shown.length }} {{ plural(shown.length, 'мероприятие', 'мероприятия', 'мероприятий') }}</span
        >
      </div>

      <p v-if="!shown.length" class="tile tile-slate" role="status">Здесь пока ничего нет.</p>
      <ul v-else class="flex flex-col gap-4" aria-label="Список мероприятий">
        <li
          v-for="event in shown"
          :key="event.id"
          class="tile tile-slate grid items-center gap-x-10 gap-y-5 md:grid-cols-[minmax(0,1fr)_auto]"
          data-rv
        >
          <div class="flex min-w-0 flex-col gap-4">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span class="tag" :class="event.source === 'own' ? 'fill-lime' : 'tag-dash'">{{
                event.source === 'own' ? 'Своё' : 'Открытое'
              }}</span>
              <span class="kicker text-ink-2"
                >{{ event.kind }}
                · {{ event.city }} · {{ formatNames[event.format] }}</span
              >
            </div>
            <h2 class="shout text-d3">
              <router-link v-if="tab === 'upcoming'" :to="inviteLink(event)" class="hover:text-link">{{
                event.name
              }}</router-link>
              <template v-else>{{ event.name }}</template>
            </h2>
            <dl class="m-0 flex flex-wrap gap-x-10 gap-y-3">
              <div class="flex flex-col gap-1.5">
                <dt class="kicker text-ink-2">Дата</dt>
                <dd class="m-0 font-semibold">{{ formatDate(event.starts_at) }}</dd>
              </div>
              <div class="flex flex-col gap-1.5">
                <dt class="kicker text-ink-2">{{ tab === 'upcoming' ? 'Дедлайн заявок' : 'Приём заявок' }}</dt>
                <dd class="m-0 font-semibold">
                  <span v-if="tab === 'upcoming'" class="tag fill-mint">{{ formatDate(event.deadline) }}</span>
                  <span v-else class="tag tag-dash">Закрыт</span>
                </dd>
              </div>
            </dl>
            <ul v-if="event.tracks.length" class="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Треки">
              <li v-for="track in event.tracks" :key="track" class="tag">{{ track }}</li>
            </ul>
          </div>
          <div class="flex flex-col items-end gap-3 max-md:items-start">
            <span class="flex items-baseline gap-2.5 whitespace-nowrap">
              <span class="font-mono text-[28px] font-semibold">{{ event.offers_count }}</span>
              <span class="text-sm text-ink-2">Предложено спикерам</span>
            </span>
            <org-button v-if="tab === 'upcoming'" :to="inviteLink(event)">Кого позвать<ArrowRightIcon /></org-button>
          </div>
        </li>
      </ul>
    </template>
  </org-page>
</template>

<script setup lang="ts">
import { ArrowRightIcon, PlusIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { addOrgEvent, listOrgEvents, type OrgEvent } from '@/api/demo'
import { formatDate, formatNames } from '@/components/org/eventLabels'
import { plural } from '@/components/org/format'
import OrgButton from '@/components/org/OrgButton.vue'
import OrgPage from '@/components/org/OrgPage.vue'

type State = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; upcoming: OrgEvent[]; past: OrgEvent[] }

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
</script>
