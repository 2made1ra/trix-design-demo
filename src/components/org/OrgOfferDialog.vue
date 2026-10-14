<template>
  <div class="scrim">
    <div ref="dialog" class="dlg" role="dialog" aria-modal="true" aria-labelledby="offer-title" tabindex="-1">
      <div v-if="state.kind !== 'sent'" class="flex flex-col gap-6">
        <div class="dlg-head">
          <div class="flex flex-col gap-2">
            <span class="k muted">Предложение выступить</span>
            <h2 id="offer-title" class="h-34">Предложить выступить</h2>
          </div>
          <button type="button" class="dlg-x" aria-label="Закрыть" @click="emit('close')">
            <XIcon aria-hidden="true" />
          </button>
        </div>

        <dl class="dlg-to">
          <div>
            <dt class="k muted">Кому</dt>
            <dd>
              <span class="person">
                <span class="ava sm" :class="toneOf(speaker.name)" aria-hidden="true">{{
                  initials(speaker.name)
                }}</span>
                <span class="cell">
                  <b>{{ speaker.name }}</b>
                  <span class="small muted">{{ speaker.direction.name }} · {{ speaker.city.name }}</span>
                </span>
              </span>
            </dd>
          </div>
          <div>
            <dt class="k muted">Мероприятие</dt>
            <dd>{{ event.name }}</dd>
          </div>
        </dl>

        <form aria-label="Предложение выступить" novalidate @submit.prevent="send">
          <div class="dlg-row">
            <app-field v-if="event.tracks.length" id="of-track" label="Трек">
              <div class="combo">
                <select id="of-track" v-model="form.track" class="inp">
                  <option v-for="track in event.tracks" :key="track" :value="track">{{ track }}</option>
                </select>
                <ChevronDownIcon aria-hidden="true" />
              </div>
            </app-field>
            <app-field
              id="of-due"
              v-model="form.answerBy"
              label="Ответить до"
              type="date"
              :min="today"
              :error="errors.answerBy"
              hint="Срок, к которому ждёте ответ"
            />
          </div>
          <app-field id="of-topic" v-model="form.topic" placeholder="Например, миграция монолита без остановки">
            <template #label>Тема доклада <span class="muted font-medium">· необязательно</span></template>
          </app-field>
          <app-field
            id="of-msg"
            v-model="form.message"
            label="Сообщение спикеру"
            multiline
            rows="5"
            :error="errors.message"
            hint="Текст подготовлен за DevRel, его можно править."
            @input="edited = true"
          />
          <p class="small muted">Спикер увидит предложение у себя в подборке и ответит: принять или отказаться.</p>
          <p v-if="state.kind === 'error'" class="err" role="alert"><CircleAlertIcon />{{ state.message }}</p>
          <div class="dlg-act">
            <app-button type="submit" variant="mint" :disabled="state.kind === 'sending'"
              >Отправить предложение</app-button
            >
            <app-button variant="line" @click="emit('close')">Отмена</app-button>
          </div>
        </form>
      </div>

      <div v-else class="dlg-ok" role="status" aria-live="polite">
        <span class="ok-ic" aria-hidden="true"><CheckIcon /></span>
        <div class="flex flex-col gap-2.5">
          <h2 id="offer-title" ref="done" class="h-34 outline-none" tabindex="-1">Предложение отправлено</h2>
          <p class="deck">
            {{ speaker.name }} увидит предложение у себя в подборке и ответит: принять или отказаться. Ответ придёт сюда
            и на почту.
          </p>
        </div>
        <dl class="dlg-to">
          <div>
            <dt class="k muted">Мероприятие</dt>
            <dd>{{ event.name }}</dd>
          </div>
          <div v-if="state.offer.track">
            <dt class="k muted">Трек</dt>
            <dd>{{ state.offer.track }}</dd>
          </div>
          <div>
            <dt class="k muted">Ответить до</dt>
            <dd><app-tag tone="mint">{{ formatDate(state.offer.answer_by) }}</app-tag></dd>
          </div>
        </dl>
        <div class="dlg-act">
          <app-button variant="mint" @click="emit('close')">Вернуться к кандидатам</app-button>
          <app-button :to="{ name: 'login' }" variant="line" @click="asSpeaker">Как это видит спикер</app-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, ChevronDownIcon, CircleAlertIcon, XIcon } from '@lucide/vue'
import { computed, nextTick, reactive, ref, useTemplateRef, watch } from 'vue'
import { createOffer, type Offer, type OrgEvent, type OrgSpeaker } from '@/api/demo'
import AppButton from '@/components/AppButton.vue'
import AppField from '@/components/AppField.vue'
import AppTag from '@/components/AppTag.vue'
import { formatDate } from '@/components/org/eventLabels'
import { initials } from '@/components/org/format'
import { toneOf } from '@/components/org/levels'
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
