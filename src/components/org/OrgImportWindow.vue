<template>
  <div class="imp">
    <div class="imp-bg" aria-hidden="true" />

    <div
      ref="win"
      class="win"
      :class="{ up: stage === 'upload', full: stage === 'review' }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="imp-title"
      tabindex="-1"
    >
      <div class="contents" :inert="abort">
        <header class="wh">
          <div class="wh-top">
            <h2 id="imp-title" class="h-20">Импорт спикеров</h2>
            <span class="fchip">
              <FileSpreadsheetIcon aria-hidden="true" />
              <b class="mono">{{ fileName }}</b>
            </span>
            <button ref="closeButton" type="button" class="x" aria-label="Закрыть окно импорта" @click="abort = true">
              <XIcon aria-hidden="true" />
            </button>
          </div>
          <ol class="stg" aria-label="Этапы импорта">
            <li
              v-for="(item, i) in stages"
              :key="item.id"
              :class="i < index ? 'done' : i === index ? 'on' : ''"
              :aria-current="i === index ? 'step' : undefined"
            >
              <CheckIcon v-if="i < index" aria-hidden="true" />
              <span>{{ item.label }}</span>
            </li>
          </ol>
        </header>

        <div class="wb">
          <section v-if="stage === 'upload'" class="s" aria-label="Загрузка файла">
            <div class="up-file">
              <span class="up-ic" aria-hidden="true"><FileSpreadsheetIcon /></span>
              <div>
                <b class="mono">{{ fileName }}</b>
                <p class="small muted">Excel{{ sizeKb ? ` · ${sizeKb} КБ` : '' }}</p>
              </div>
            </div>
            <div class="imp-bar" role="progressbar" aria-label="Загрузка файла" aria-busy="true"><i /></div>
            <p class="small muted" role="status">Загружаем файл</p>
            <div class="wrow"><app-button variant="line" sm @click="ctl.cancel()">Отменить</app-button></div>
          </section>

          <section v-else-if="stage === 'parse'" class="s" aria-label="Разбор файла">
            <ul class="pst" aria-live="polite">
              <li v-for="step in parseSteps" :key="step.title" :class="step.done ? 'done' : 'run'">
                <span class="pic">
                  <CheckIcon v-if="step.done" aria-hidden="true" />
                  <i v-else class="pulse" />
                </span>
                <b>{{ step.title }}<span class="sr">, {{ step.done ? 'готово' : 'в процессе' }}</span></b>
                <span class="muted">{{ step.note }}</span>
              </li>
            </ul>
            <div class="wrow"><app-button variant="line" sm @click="ctl.cancel()">Отменить</app-button></div>
          </section>

          <section v-else-if="stage === 'ask' && imp" class="s" aria-label="Решения по файлу">
            <div class="qh">
              <span class="k muted" aria-live="polite">Вопрос {{ q + 1 }} из {{ imp.questions.length }}</span>
            </div>

            <app-tile v-if="ctl.currentDirections.value" :key="ctl.currentDirections.value.id" class="dq">
              <h3 ref="heading" tabindex="-1">{{ ctl.currentDirections.value.title }}</h3>
              <ul class="vals" aria-label="Значения для проверки">
                <li v-for="value in ctl.currentDirections.value.values" :key="value.id">
                  <span class="mono">{{ value.raw }}</span>
                  <MoveRightIcon aria-hidden="true" />
                  <app-picks as="fieldset" :aria-label="`Направление для «${value.raw}»`">
                    <app-pick
                      v-for="option in shown(ctl.currentDirections.value, value)"
                      :key="option.id"
                      :pressed="ctl.dirs[value.id] === option.id"
                      @click="ctl.setDirection(value.id, option.id)"
                    >
                      {{ option.name }}
                    </app-pick>
                    <select
                      v-if="others(ctl.currentDirections.value, value).length"
                      class="inp h-10.5 w-auto min-w-0"
                      :aria-label="`Другое направление для «${value.raw}»`"
                      :value="''"
                      @change="pickOther(value.id, $event)"
                    >
                      <option value="" disabled>Другое направление…</option>
                      <option
                        v-for="option in others(ctl.currentDirections.value, value)"
                        :key="option.id"
                        :value="option.id"
                      >
                        {{ option.name }}
                      </option>
                    </select>
                  </app-picks>
                  <p class="hint why2">Так решила модель, поменяйте, если не так</p>
                </li>
              </ul>
            </app-tile>

            <app-tile v-else-if="ctl.currentMail.value" :key="ctl.currentMail.value.id" class="dq">
              <h3 ref="heading" tabindex="-1">{{ ctl.currentMail.value.title }}</h3>
              <template v-if="decision?.kind === 'open'">
                <form class="row" novalidate @submit.prevent="addMail">
                  <app-field
                    id="mail"
                    v-model="mailDraft"
                    :label="`Рабочая почта ${firstName}`"
                    type="email"
                    autocomplete="off"
                    placeholder="p.lebedev@company.ru"
                    :aria-invalid="!!mailError"
                    aria-describedby="mail-hint"
                  />
                  <app-button type="submit" variant="ink" sm class="self-end">Добавить</app-button>
                  <app-button variant="line" sm class="self-end" @click="ctl.skipMail(ctl.currentMail.value.row_id)">
                    Не приглашать
                  </app-button>
                </form>
                <p id="mail-hint" :class="mailError ? 'err' : 'hint'" role="status" aria-live="polite">
                  {{ mailError || 'Без почты приглашение не отправить, строка останется в таблице без приглашения' }}
                </p>
              </template>
              <div v-else class="q2-res" role="status" aria-live="polite">
                <app-tag tone="mint">Решено</app-tag>
                <span class="small">
                  {{
                    decision?.kind === 'mail'
                      ? `Почта добавлена: ${decision.email}`
                      : `${ctl.currentMail.value.person} не приглашается, строка останется в таблице без приглашения`
                  }}
                </span>
                <button type="button" class="ln small lnb" @click="ctl.reopenMail(ctl.currentMail.value.row_id)">
                  Изменить
                </button>
              </div>
            </app-tile>

            <div class="qact">
              <app-button variant="line" sm :disabled="q === 0" @click="ctl.go(q - 1)">Назад</app-button>
              <div class="qact-r">
                <span class="small muted">{{ hint }}</span>
                <app-button v-if="q < imp.questions.length - 1" variant="ink" sm @click="ctl.go(q + 1)">
                  Дальше
                </app-button>
                <app-button v-else variant="mint" :disabled="ctl.unresolved.value || busy" @click="ctl.toReview()">
                  Перейти к проверке<ArrowRightIcon />
                </app-button>
              </div>
            </div>
            <fieldset class="dots" aria-label="Вопросы">
              <button
                v-for="(_, i) in imp.questions"
                :key="i"
                type="button"
                class="dot"
                :aria-label="`Вопрос ${i + 1} из ${imp.questions.length}`"
                :aria-current="i === q"
                @click="ctl.go(i)"
              />
            </fieldset>
          </section>

          <section v-else-if="stage === 'review' && imp" class="s" aria-label="Проверка превью">
            <div class="rv-top">
              <div class="sum" aria-live="polite">
                <app-tag tone="mint">{{ imp.summary.ready }} готовы к приглашению</app-tag>
                <app-tag v-if="imp.summary.no_email" tone="pink">{{ imp.summary.no_email }} без почты</app-tag>
                <app-tag v-if="imp.summary.skipped" tone="dash">{{ imp.summary.skipped }} не приглашаем</app-tag>
              </div>
            </div>

            <details class="map">
              <summary class="ln small">Изменить сопоставление</summary>
              <div class="map-row">
                <div v-for="(column, i) in imp.columns" :key="column.source" class="mf">
                  <label class="k muted mono" :for="`map-${i}`">{{ column.source }}</label>
                  <div class="combo">
                    <select :id="`map-${i}`" v-model="mapping[i]" class="inp">
                      <option v-for="target in targets" :key="target" :value="target">{{ target }}</option>
                    </select>
                    <ChevronDownIcon aria-hidden="true" />
                  </div>
                </div>
              </div>
            </details>

            <div>
              <section class="tbl" :tabindex="0" aria-label="Превью таблицы, прокручивается по горизонтали">
                <table>
                  <thead>
                    <tr>
                      <th
                        v-for="(column, i) in imp.columns"
                        :key="column.source"
                        scope="col"
                        :style="{ minWidth: `${widths[i]}px` }"
                      >
                        <div class="hc">
                          <span class="k muted mono">{{ column.source }}</span>
                          <span class="hv"
                            ><span class="muted" aria-hidden="true">→ </span><span>{{ mapping[i] }}</span></span
                          >
                          <app-tag v-if="i === imp.columns.length - 1" tone="lime">Разобрано моделью</app-tag>
                        </div>
                      </th>
                      <th scope="col" style="min-width: 160px">
                        <div class="hc">
                          <span class="k muted">Результат</span>
                          <span class="hv">Статус</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in imp.rows" :key="row.id" :class="{ pvr: row.status === 'no_email' }">
                      <th scope="row">
                        <span class="person">
                          <span class="ava" :class="tone(row.id)" aria-hidden="true">{{ initials(row.name) }}</span>
                          <b>{{ row.name }}</b>
                        </span>
                      </th>
                      <td>
                        <span v-if="row.email" class="mono small">{{ row.email }}</span>
                        <span v-else class="muted">—</span>
                      </td>
                      <td>{{ row.city }}</td>
                      <td>{{ row.direction }}</td>
                      <td>
                        <div v-if="row.past_talks.length" class="chs">
                          <span v-for="talk in row.past_talks" :key="talk.label" class="ch">
                            {{ talk.label }}{{ talk.year ? ` · ${talk.year}` : '' }}
                          </span>
                        </div>
                        <span v-else class="muted">—</span>
                        <span v-if="row.past_talks.length" class="src small muted">«{{ row.source_text }}»</span>
                      </td>
                      <td>
                        <app-tag :tone="statuses[row.status].tone">{{ statuses[row.status].label }}</app-tag>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>
              <p class="small muted mt-3">
                Все {{ imp.rows.length }} {{ plural(imp.rows.length, 'строка', 'строки', 'строк') }} файла. Исходный
                текст ячейки «Где выступал» показан серым под результатом разбора
              </p>
            </div>
          </section>
        </div>

        <div v-if="stage === 'review' && imp" class="wfoot act">
          <div class="act-in">
            <div class="act-l">
              <details>
                <summary class="small">
                  Отправим {{ invitesText }} с адреса no-reply@trix · <span class="ln">превью письма</span>
                </summary>
                <app-tile tone="slate" class="mail">
                  <dl>
                    <dt>От кого</dt>
                    <dd class="mono">no-reply@trix</dd>
                    <dt>Кому</dt>
                    <dd>каждому спикеру из таблицы, по рабочей почте</dd>
                    <dt>Тема</dt>
                    <dd>{{ orgName }} приглашает вас в TRIX</dd>
                  </dl>
                  <p class="small">
                    Вас пригласили в TRIX от имени {{ orgName }}. Мы уже заполнили профиль данными из таблицы: проверьте
                    их и подберите мероприятия под ваш доклад.
                  </p>
                  <app-button as="span" variant="mint" sm class="pointer-events-none self-start"
                    >Принять приглашение</app-button
                  >
                </app-tile>
              </details>
            </div>
            <div class="act-r">
              <app-button variant="line" sm :disabled="busy" @click="ctl.toAsk()"> Назад к решениям </app-button>
              <app-button variant="mint" :disabled="busy || !imp.summary.ready" @click="ctl.send()">
                Разослать {{ invitesText }}<ArrowRightIcon />
              </app-button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="abort" class="abort">
        <app-tile
          class="abort-c"
          ref="confirm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="abort-title"
          aria-describedby="abort-text"
          tabindex="-1"
        >
          <h3 id="abort-title">Прервать импорт?</h3>
          <p id="abort-text" class="small muted">Файл не сохранится, придётся загрузить его заново</p>
          <div class="wrow">
            <app-button variant="mint" sm @click="abort = false">Продолжить</app-button>
            <app-button variant="line" sm @click="ctl.cancel()">Прервать</app-button>
          </div>
        </app-tile>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, FileSpreadsheetIcon, MoveRightIcon, XIcon } from '@lucide/vue'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import type { ImportDirectionQuestion, SpeakerImportRow } from '@/api/demo'
import AppButton from '@/components/AppButton.vue'
import AppField from '@/components/AppField.vue'
import AppPick from '@/components/AppPick.vue'
import AppPicks from '@/components/AppPicks.vue'
import AppTag from '@/components/AppTag.vue'
import AppTile from '@/components/AppTile.vue'
import { initials, plural } from '@/components/org/format'
import { useModal } from '@/components/org/useModal'
import type { SpeakerImportController } from '@/components/org/useSpeakerImport'
import type { TagTone } from '@/components/tones'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{ ctl: SpeakerImportController; fileName: string }>()

const { org } = useAuth()
const win = useTemplateRef<HTMLElement>('win')
const confirm = useTemplateRef<HTMLElement>('confirm')
const heading = useTemplateRef<HTMLElement>('heading')
const abort = ref(false)

// Esc по очереди открывает и закрывает вопрос «Прервать импорт?», Tab ходит по верхнему из двух окон.
useModal(
  () => (abort.value ? confirm.value : win.value),
  () => {
    abort.value = !abort.value
  },
)

const stages = [
  { id: 'upload', label: 'Загрузка' },
  { id: 'parse', label: 'Разбор' },
  { id: 'ask', label: 'Решения' },
  { id: 'review', label: 'Проверка' },
]
const targets = ['Имя', 'Рабочая почта', 'Город', 'Направление', 'Прошлые выступления', 'Не импортировать']
const widths = [180, 200, 140, 140, 260]
const statuses: Record<SpeakerImportRow['status'], { label: string; tone: TagTone }> = {
  will_invite: { label: 'Будет приглашён', tone: 'ink' },
  no_email: { label: 'Нет почты', tone: 'pink' },
  skipped: { label: 'Не приглашаем', tone: 'dash' },
}
const tones = ['mint', 'yellow', 'uv', 'orange', 'pink'] as const
const tone = (id: string) => tones[(Number.parseInt(id.replace(/\D/g, ''), 10) - 1) % tones.length] ?? 'mint'

const stage = computed(() => props.ctl.stage.value)
const index = computed(() => stages.findIndex((item) => item.id === stage.value))
const run = computed(() => (props.ctl.state.value.kind === 'running' ? props.ctl.state.value : null))
const imp = computed(() => run.value?.imp ?? null)
const q = computed(() => run.value?.q ?? 0)
const busy = computed(() => run.value?.busy ?? false)
const sizeKb = computed(() => imp.value?.size_kb ?? 0)
const orgName = computed(() => org.value?.name ?? 'Организация')

const mapping = ref<string[]>([])
watch(
  () => imp.value?.columns,
  (columns) => {
    if (columns && mapping.value.length !== columns.length) mapping.value = columns.map((column) => column.target)
  },
  { immediate: true },
)

const parseSteps = computed(() => {
  const found = imp.value?.found
  return [
    {
      title: 'Читаем файл',
      done: !!found,
      note: found ? `${found.rows} ${plural(found.rows, 'строка', 'строки', 'строк')}` : '',
    },
    {
      title: 'Сопоставляем колонки',
      done: !!found,
      note: found ? `узнали ${found.columns} ${plural(found.columns, 'колонку', 'колонки', 'колонок')}` : '',
    },
    {
      title: 'Разбираем прошлые выступления',
      done: false,
      note: found ? `нашли ${found.talks} ${plural(found.talks, 'выступление', 'выступления', 'выступлений')}` : '',
    },
  ]
})

type DirectionValue = ImportDirectionQuestion['values'][number]

// Варианты-кандидаты и уже выбранное направление, остальные уходят в select.
const shown = (question: ImportDirectionQuestion, value: DirectionValue) =>
  question.options.filter((o) => value.candidates.includes(o.id) || o.id === props.ctl.dirs[value.id])
const others = (question: ImportDirectionQuestion, value: DirectionValue) =>
  question.options.filter((o) => !shown(question, value).includes(o))
const pickOther = (valueId: string, event: Event) => {
  const select = event.target as HTMLSelectElement
  props.ctl.setDirection(valueId, select.value)
  select.value = ''
}

const decision = computed(() => {
  const question = props.ctl.currentMail.value
  return question ? props.ctl.mails[question.row_id] : null
})
const firstName = computed(() => props.ctl.currentMail.value?.person.split(' ')[0] ?? '')
const hint = computed(() =>
  q.value === (imp.value?.questions.length ?? 1) - 1 && props.ctl.unresolved.value
    ? 'Добавьте почту или исключите спикера'
    : '',
)

const mailDraft = ref('')
const mailError = ref('')
const addMail = () => {
  const question = props.ctl.currentMail.value
  if (!question) return
  mailError.value = props.ctl.decideMail(question.row_id, mailDraft.value) ? '' : 'Нужна почта вида имя@домен'
}

const invitesText = computed(() => {
  const n = imp.value?.summary.ready ?? 0
  return `${n} ${plural(n, 'приглашение', 'приглашения', 'приглашений')}`
})

// Фокус следует за этапом: на заголовок вопроса, на окно при остальных этапах.
watch([stage, q], async () => {
  await nextTick()
  if (stage.value === 'ask') heading.value?.focus({ preventScroll: true })
  else win.value?.focus({ preventScroll: true })
})
watch(abort, async (on) => {
  await nextTick()
  if (on) confirm.value?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true })
})
</script>
