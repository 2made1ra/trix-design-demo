<template>
  <div class="org-scrim fixed inset-0 z-100 flex items-start justify-center overflow-y-auto px-6 pt-22 pb-10">
    <div
      ref="dialog"
      class="org-dlg relative flex w-full max-w-160 flex-col gap-6 rounded-[18px] bg-paper p-8 text-ink shadow-[0_1px_2px_rgb(0_0_0/8%),0_40px_80px_-24px_rgb(0_0_0/50%)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-title"
      tabindex="-1"
    >
      <template v-if="state.kind !== 'sent'">
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-2">
            <span class="kicker text-ink-2">Предложение выступить</span>
            <h2 id="offer-title" class="shout text-d3">Предложить выступить</h2>
          </div>
          <button
            type="button"
            class="flex size-9 flex-none items-center justify-center rounded-full shadow-[inset_0_0_0_1px_var(--field)] hover:bg-paper-2"
            aria-label="Закрыть"
            @click="emit('close')"
          >
            <XIcon class="size-4" />
          </button>
        </div>

        <dl
          class="m-0 flex flex-wrap gap-x-10 gap-y-3 py-4 shadow-[inset_0_1px_0_var(--line-2),inset_0_-1px_0_var(--line-2)]"
        >
          <div class="flex min-w-0 flex-col gap-1.5">
            <dt class="kicker text-ink-2">Кому</dt>
            <dd class="m-0 font-semibold">
              <span class="flex items-center gap-3">
                <org-avatar :name="speaker.name" :tone="toneOf(speaker.name)" small />
                <span class="flex flex-col"
                  ><b>{{ speaker.name }}</b
                  ><span class="text-sm font-medium text-ink-2"
                    >{{ speaker.direction.name }}
                    · {{ speaker.city.name }}</span
                  ></span
                >
              </span>
            </dd>
          </div>
          <div class="flex min-w-0 flex-col gap-1.5">
            <dt class="kicker text-ink-2">Мероприятие</dt>
            <dd class="m-0 font-semibold">{{ event.name }}</dd>
          </div>
        </dl>

        <form class="flex flex-col gap-5" aria-label="Предложение выступить" novalidate @submit.prevent="send">
          <div class="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
            <div v-if="event.tracks.length" class="flex flex-col gap-2.5">
              <label for="of-track" class="org-label">Трек</label>
              <select id="of-track" v-model="form.track" class="org-inp">
                <option v-for="track in event.tracks" :key="track" :value="track">{{ track }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-2.5">
              <label for="of-due" class="org-label">Ответить до</label>
              <input
                id="of-due"
                v-model="form.answerBy"
                class="org-inp"
                type="date"
                :min="today"
                :aria-invalid="!!errors.answerBy"
                aria-describedby="of-due-hint"
              >
              <p v-if="errors.answerBy" class="org-err" role="alert">{{ errors.answerBy }}</p>
              <p v-else id="of-due-hint" class="text-[13px] text-ink-2">Срок, к которому ждёте ответ</p>
            </div>
          </div>
          <div class="flex flex-col gap-2.5">
            <label for="of-topic" class="org-label"
              >Тема доклада <span class="font-medium text-ink-2">· необязательно</span></label
            >
            <input
              id="of-topic"
              v-model="form.topic"
              class="org-inp"
              type="text"
              placeholder="Например, миграция монолита без остановки"
            >
          </div>
          <div class="flex flex-col gap-2.5">
            <label for="of-msg" class="org-label">Сообщение спикеру</label>
            <textarea
              id="of-msg"
              v-model="form.message"
              class="org-inp"
              rows="5"
              :aria-invalid="!!errors.message"
              @input="edited = true"
            />
            <p v-if="errors.message" class="org-err" role="alert">{{ errors.message }}</p>
            <p v-else class="text-[13px] text-ink-2">Текст подготовлен за DevRel, его можно править.</p>
          </div>
          <p class="text-sm text-ink-2">
            Спикер увидит предложение у себя в подборке и ответит: принять или отказаться.
          </p>
          <p v-if="state.kind === 'error'" class="org-err" role="alert">{{ state.message }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <org-button type="submit" :disabled="state.kind === 'sending'">Отправить предложение</org-button>
            <org-button variant="line" @click="emit('close')">Отмена</org-button>
          </div>
        </form>
      </template>

      <div v-else class="flex flex-col gap-5" role="status" aria-live="polite">
        <span class="flex size-12 items-center justify-center rounded-full bg-(--side)" aria-hidden="true"
          ><CheckIcon class="size-6" /></span
        >
        <h2 id="offer-title" ref="done" class="shout text-d3 outline-none" tabindex="-1">Предложение отправлено</h2>
        <p class="text-ink-2">
          {{ speaker.name }} увидит предложение у себя в подборке и ответит: принять или отказаться.
        </p>
        <dl
          class="m-0 flex flex-wrap gap-x-10 gap-y-3 py-4 shadow-[inset_0_1px_0_var(--line-2),inset_0_-1px_0_var(--line-2)]"
        >
          <div class="flex flex-col gap-1.5">
            <dt class="kicker text-ink-2">Мероприятие</dt>
            <dd class="m-0 font-semibold">{{ event.name }}</dd>
          </div>
          <div v-if="state.offer.track" class="flex flex-col gap-1.5">
            <dt class="kicker text-ink-2">Трек</dt>
            <dd class="m-0 font-semibold">{{ state.offer.track }}</dd>
          </div>
          <div class="flex flex-col gap-1.5">
            <dt class="kicker text-ink-2">Ответить до</dt>
            <dd class="m-0"><span class="tag fill-mint">{{ formatDate(state.offer.answer_by) }}</span></dd>
          </div>
        </dl>
        <div class="flex flex-wrap items-center gap-3">
          <org-button @click="emit('close')">Вернуться к кандидатам</org-button>
          <org-button variant="line" :to="{ name: 'login' }" @click="asSpeaker">Как это видит спикер</org-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, XIcon } from '@lucide/vue'
import { computed, nextTick, reactive, ref, useTemplateRef, watch } from 'vue'
import { createOffer, type Offer, type OrgEvent, type OrgSpeaker } from '@/api/demo'
import { formatDate } from '@/components/org/eventLabels'
import { toneOf } from '@/components/org/levels'
import OrgAvatar from '@/components/org/OrgAvatar.vue'
import OrgButton from '@/components/org/OrgButton.vue'
import { useModal } from '@/components/org/useModal'
import { useAuth } from '@/composables/useAuth'

type State =
  | { kind: 'form' }
  | { kind: 'sending' }
  | { kind: 'error'; message: string }
  | { kind: 'sent'; offer: Offer }

const props = defineProps<{ event: OrgEvent; speaker: OrgSpeaker }>()
const emit = defineEmits<{ close: []; sent: [offer: Offer] }>()

const { logout } = useAuth()
const dialog = useTemplateRef<HTMLElement>('dialog')
const done = useTemplateRef<HTMLElement>('done')
useModal(
  () => dialog.value,
  () => emit('close'),
)

const state = ref<State>({ kind: 'form' })
const edited = ref(false)
const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  track: props.event.tracks[0] ?? '',
  topic: '',
  answerBy: props.event.deadline.slice(0, 10),
  message: '',
})
const errors = reactive({ answerBy: '', message: '' })

const firstName = computed(() => props.speaker.name.split(' ')[0])
const template = () => {
  const date = form.answerBy
    ? new Date(form.answerBy).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : 'выбранной даты'
  const track = form.track
    ? `Ваши доклады совпадают с треком «${form.track}», и нам хочется услышать вас у нас.`
    : 'Нам хочется услышать вас у нас.'
  return `${firstName.value}, добрый день. Мы готовим «${props.event.name}», ${props.event.city}. ${track} Если тема и формат подходят, подтвердите участие до ${date}.`
}
form.message = template()
watch([() => form.track, () => form.answerBy], () => {
  if (!edited.value) form.message = template()
})

const send = async () => {
  errors.answerBy = form.answerBy ? '' : 'Укажите срок ответа'
  errors.message = form.message.trim() ? '' : 'Напишите сообщение спикеру'
  if (errors.answerBy || errors.message) return
  state.value = { kind: 'sending' }
  const res = await createOffer(props.event.id, {
    speaker_id: props.speaker.id,
    track: form.track || undefined,
    topic: form.topic.trim() || undefined,
    message: form.message.trim(),
    answer_by: form.answerBy,
  })
  if (res.status !== 201) {
    state.value = { kind: 'error', message: res.data.message }
    return
  }
  state.value = { kind: 'sent', offer: res.data }
  emit('sent', res.data)
  await nextTick()
  done.value?.focus()
}

// «Как это видит спикер»: из кабинета организации выходим, дальше вход демо-спикером.
const asSpeaker = () => logout()
</script>
