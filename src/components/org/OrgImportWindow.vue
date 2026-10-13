<template>
  <div class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
    <div class="org-imp-bg" aria-hidden="true" />

    <div
      ref="win"
      class="org-win max-h-full"
      :class="stage === 'review' ? 'size-full' : stage === 'upload' ? 'w-140 max-w-full' : 'w-160 max-w-full'"
      role="dialog"
      aria-modal="true"
      aria-labelledby="imp-title"
      tabindex="-1"
      :inert="abort"
    >
      <header class="flex flex-col gap-4 px-6 pt-5 pb-4 shadow-[inset_0_-1px_0_var(--line-2)]">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
          <h2 id="imp-title" class="min-w-0 flex-1 text-xl leading-tight font-bold">Импорт спикеров</h2>
          <span
            class="inline-flex h-9 items-center gap-2 rounded-full bg-paper/60 px-3.5 text-[13px] whitespace-nowrap"
          >
            <FileSpreadsheetIcon class="size-4" />
            <b class="font-mono font-semibold">{{ fileName }}</b>
          </span>
          <button
            ref="closeButton"
            type="button"
            class="flex size-10 items-center justify-center rounded-full bg-paper/60 shadow-[inset_0_0_0_1px_var(--field)] hover:bg-paper-2"
            aria-label="Закрыть окно импорта"
            @click="abort = true"
          >
            <XIcon class="size-4.5" />
          </button>
        </div>
        <ol class="flex flex-wrap gap-x-5 gap-y-2" aria-label="Этапы импорта">
          <li
            v-for="(item, i) in stages"
            :key="item.id"
            class="inline-flex items-center gap-1.5 text-[13px] before:mr-2 before:h-px before:w-4 before:bg-line first:before:hidden"
            :class="i < index ? 'text-ink-2' : i === index ? 'font-semibold text-ink' : 'text-quiet'"
            :aria-current="i === index ? 'step' : undefined"
          >
            <CheckIcon v-if="i < index" class="size-3.25" />
            <span :class="i === index && 'shadow-[inset_0_-3px_0_var(--side)]'">{{ item.label }}</span>
          </li>
        </ol>
      </header>

      <div class="flex min-h-0 flex-1 flex-col gap-5 overflow-auto p-6">
        <section v-if="stage === 'upload'" class="flex flex-col gap-5" aria-label="Загрузка файла">
          <div class="flex items-center gap-4">
            <span
              class="flex size-12 flex-none items-center justify-center rounded-[14px] bg-(--side)/55"
              aria-hidden="true"
            >
              <FileSpreadsheetIcon class="size-5.5" />
            </span>
            <div>
              <b class="font-mono">{{ fileName }}</b>
              <p class="text-sm text-ink-2">Excel{{ sizeKb ? ` · ${sizeKb} КБ` : '' }}</p>
            </div>
          </div>
          <div
            class="h-1.5 overflow-hidden rounded-[3px] bg-line"
            role="progressbar"
            aria-label="Загрузка файла"
            aria-busy="true"
          >
            <div class="org-bar h-full"><i /></div>
          </div>
          <p class="text-sm text-ink-2" role="status">Загружаем файл</p>
          <div><org-button variant="line" size="sm" @click="ctl.cancel()">Отменить</org-button></div>
        </section>

        <section v-else-if="stage === 'parse'" class="flex flex-col gap-5" aria-label="Разбор файла">
          <ul class="flex flex-col" aria-live="polite">
            <li
              v-for="(step, i) in parseSteps"
              :key="step.title"
              class="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 py-4"
              :class="i > 0 && 'shadow-[inset_0_1px_0_var(--line-2)]'"
            >
              <span
                class="flex size-7 items-center justify-center rounded-full"
                :class="step.done ? 'bg-(--side) text-[#131313]' : 'shadow-[inset_0_0_0_1px_var(--field)]'"
              >
                <CheckIcon v-if="step.done" class="size-3.5" />
                <i v-else class="org-pulse" />
              </span>
              <b class="font-semibold"
                >{{ step.title }}<span class="sr-only">, {{ step.done ? 'готово' : 'в процессе' }}</span></b
              >
              <span class="text-ink-2">{{ step.note }}</span>
            </li>
          </ul>
          <div><org-button variant="line" size="sm" @click="ctl.cancel()">Отменить</org-button></div>
        </section>

        <section v-else-if="stage === 'ask' && imp" class="flex flex-col gap-5" aria-label="Решения по файлу">
          <span class="kicker text-ink-2" aria-live="polite">Вопрос {{ q + 1 }} из {{ imp.questions.length }}</span>

          <div
            v-if="ctl.currentDirections.value"
            :key="ctl.currentDirections.value.id"
            class="tile flex flex-col gap-5 bg-paper/55 px-7 py-6"
          >
            <h3 ref="heading" class="text-lg leading-[1.35] font-semibold outline-none" tabindex="-1">
              {{ ctl.currentDirections.value.title }}
            </h3>
            <ul class="flex flex-col" aria-label="Значения для проверки">
              <li
                v-for="value in ctl.currentDirections.value.values"
                :key="value.id"
                class="grid items-center gap-x-4 gap-y-2 py-3 shadow-[inset_0_1px_0_var(--line-2)] sm:grid-cols-[minmax(120px,190px)_20px_minmax(0,1fr)]"
              >
                <span class="font-mono break-words">{{ value.raw }}</span>
                <MoveRightIcon class="size-4.5 text-quiet max-sm:hidden" aria-hidden="true" />
                <fieldset
                  class="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0"
                  :aria-label="`Направление для «${value.raw}»`"
                >
                  <button
                    v-for="option in ctl.currentDirections.value.options"
                    :key="option.id"
                    type="button"
                    class="pick"
                    :aria-pressed="ctl.dirs[value.id] === option.id"
                    @click="ctl.setDirection(value.id, option.id)"
                  >
                    {{ option.name }}
                  </button>
                </fieldset>
                <p class="text-[13px] text-ink-2 sm:col-start-3">Так решила модель, поменяйте, если не так</p>
              </li>
            </ul>
          </div>

          <div
            v-else-if="ctl.currentMail.value"
            :key="ctl.currentMail.value.id"
            class="tile flex flex-col gap-5 bg-paper/55 px-7 py-6"
          >
            <h3 ref="heading" class="text-lg leading-[1.35] font-semibold outline-none" tabindex="-1">
              {{ ctl.currentMail.value.title }}
            </h3>
            <template v-if="decision?.kind === 'open'">
              <form class="flex flex-wrap items-end gap-3" novalidate @submit.prevent="addMail">
                <div class="flex min-w-60 flex-1 flex-col gap-2.5">
                  <label for="mail" class="org-label">Рабочая почта {{ firstName }}</label>
                  <input
                    id="mail"
                    v-model="mailDraft"
                    class="org-inp"
                    type="email"
                    autocomplete="off"
                    placeholder="p.lebedev@company.ru"
                    :aria-invalid="!!mailError"
                    aria-describedby="mail-hint"
                  >
                </div>
                <org-button type="submit" variant="ink" size="sm">Добавить</org-button>
                <org-button variant="line" size="sm" @click="ctl.skipMail(ctl.currentMail.value.row_id)"
                  >Не приглашать</org-button
                >
              </form>
              <p
                id="mail-hint"
                class="text-[13px]"
                :class="mailError ? 'org-err' : 'text-ink-2'"
                role="status"
                aria-live="polite"
              >
                {{ mailError || 'Без почты приглашение не отправить, строка останется в таблице без приглашения' }}
              </p>
            </template>
            <div v-else class="flex flex-wrap items-center gap-3" role="status" aria-live="polite">
              <span class="tag fill-mint">Решено</span>
              <span class="text-sm">
                {{
                  decision?.kind === 'mail'
                    ? `Почта добавлена: ${decision.email}`
                    : `${ctl.currentMail.value.person} не приглашается, строка останется в таблице без приглашения`
                }}
              </span>
              <button
                type="button"
                class="text-sm text-ink shadow-[inset_0_-1px_0_currentColor]"
                @click="ctl.reopenMail(ctl.currentMail.value.row_id)"
              >
                Изменить
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <org-button variant="line" size="sm" :disabled="q === 0" @click="ctl.go(q - 1)">Назад</org-button>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm text-ink-2">{{ hint }}</span>
              <org-button v-if="q < imp.questions.length - 1" variant="ink" size="sm" @click="ctl.go(q + 1)"
                >Дальше</org-button
              >
              <org-button v-else :disabled="ctl.unresolved.value || busy" @click="ctl.toReview()">
                Перейти к проверке<ArrowRightIcon />
              </org-button>
            </div>
          </div>
          <fieldset class="m-0 flex justify-center border-0 p-0" aria-label="Вопросы">
            <button
              v-for="(_, i) in imp.questions"
              :key="i"
              type="button"
              class="group grid size-6 place-items-center"
              :aria-label="`Вопрос ${i + 1} из ${imp.questions.length}`"
              :aria-current="i === q"
              @click="ctl.go(i)"
            >
              <span
                class="h-2 rounded-full bg-ink transition-[width] group-aria-[current=true]:w-5 w-2 opacity-50 group-aria-[current=true]:opacity-100"
              />
            </button>
          </fieldset>
        </section>

        <section v-else-if="stage === 'review' && imp" class="flex flex-col gap-5" aria-label="Проверка превью">
          <div class="flex flex-wrap items-center gap-2" aria-live="polite">
            <span class="tag fill-mint">{{ imp.summary.ready }} готовы к приглашению</span>
            <span v-if="imp.summary.no_email" class="tag fill-pink">{{ imp.summary.no_email }} без почты</span>
            <span v-if="imp.summary.skipped" class="tag tag-dash">{{ imp.summary.skipped }} не приглашаем</span>
          </div>

          <details>
            <summary class="cursor-pointer text-sm text-ink shadow-[inset_0_-1px_0_currentColor] w-fit">
              Изменить сопоставление
            </summary>
            <div class="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
              <div v-for="(column, i) in imp.columns" :key="column.source" class="flex min-w-0 flex-col gap-1.5">
                <label class="kicker font-mono text-ink-2 normal-case" :for="`map-${i}`">{{ column.source }}</label>
                <select :id="`map-${i}`" v-model="mapping[i]" class="org-inp h-10 text-sm font-semibold">
                  <option v-for="target in targets" :key="target" :value="target">{{ target }}</option>
                </select>
              </div>
            </div>
          </details>

          <div>
            <section
              class="overflow-x-auto rounded-[18px] bg-paper/70 shadow-[inset_0_0_0_1px_var(--line)]"
              :tabindex="0"
              aria-label="Превью таблицы, прокручивается по горизонтали"
            >
              <table class="org-tbl w-full min-w-245 border-collapse text-left">
                <thead>
                  <tr>
                    <th v-for="(column, i) in imp.columns" :key="column.source" scope="col" :class="widths[i]">
                      <div class="flex flex-col items-start gap-1.5">
                        <span class="font-mono text-[11px] tracking-wider text-ink-2">{{ column.source }}</span>
                        <span class="text-sm font-semibold"
                          ><span class="text-ink-2" aria-hidden="true">→ </span>{{ mapping[i] }}</span
                        >
                        <span v-if="i === imp.columns.length - 1" class="tag fill-lime">Разобрано моделью</span>
                      </div>
                    </th>
                    <th scope="col" class="min-w-40">
                      <div class="flex flex-col items-start gap-1.5">
                        <span class="kicker text-ink-2">Результат</span>
                        <span class="text-sm font-semibold">Статус</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in imp.rows"
                    :key="row.id"
                    :class="row.status === 'no_email' && 'bg-[color-mix(in_srgb,var(--pink)_14%,transparent)]'"
                  >
                    <th scope="row">
                      <span class="flex items-center gap-3 whitespace-nowrap">
                        <org-avatar :name="row.name" :tone="tone(row.id)" small />
                        <b class="font-medium">{{ row.name }}</b>
                      </span>
                    </th>
                    <td>
                      <span v-if="row.email" class="font-mono text-sm">{{ row.email }}</span>
                      <span v-else class="text-ink-2">—</span>
                    </td>
                    <td>{{ row.city }}</td>
                    <td>{{ row.direction }}</td>
                    <td>
                      <div v-if="row.past_talks.length" class="flex flex-wrap gap-1.5">
                        <span
                          v-for="talk in row.past_talks"
                          :key="talk.label"
                          class="inline-flex h-7 items-center rounded-2xl bg-(--side)/55 px-3 text-[13px] font-semibold whitespace-nowrap"
                        >
                          {{ talk.label }}{{ talk.year ? ` · ${talk.year}` : '' }}
                        </span>
                      </div>
                      <span v-else class="text-ink-2">—</span>
                      <span v-if="row.past_talks.length" class="mt-1.5 block text-sm text-ink-2"
                        >«{{ row.source_text }}»</span
                      >
                    </td>
                    <td>
                      <span class="tag" :class="statuses[row.status].class">{{ statuses[row.status].label }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
            <p class="mt-3 text-sm text-ink-2">
              Все {{ imp.rows.length }} {{ plural(imp.rows.length, 'строка', 'строки', 'строк') }} файла. Исходный текст
              ячейки «Где выступал» показан серым под результатом разбора
            </p>
          </div>
        </section>
      </div>

      <div
        v-if="stage === 'review' && imp"
        class="flex-none rounded-b-[28px] bg-paper/70 shadow-[inset_0_1px_0_var(--line)]"
      >
        <div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-4">
          <details class="min-w-0">
            <summary class="cursor-pointer text-sm">
              Отправим {{ invitesText }} с адреса no-reply@trix ·
              <span class="shadow-[inset_0_-1px_0_currentColor]">превью письма</span>
            </summary>
            <div class="tile tile-slate mt-3 flex max-w-130 flex-col gap-3 p-5">
              <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt class="text-ink-2">От кого</dt>
                <dd class="font-mono">no-reply@trix</dd>
                <dt class="text-ink-2">Кому</dt>
                <dd>каждому спикеру из таблицы, по рабочей почте</dd>
                <dt class="text-ink-2">Тема</dt>
                <dd>{{ orgName }} приглашает вас в TRIX</dd>
              </dl>
              <p class="text-sm">
                Вас пригласили в TRIX от имени {{ orgName }}. Мы уже заполнили профиль данными из таблицы: проверьте их
                и подберите мероприятия под ваш доклад.
              </p>
              <span
                class="fill-mint pointer-events-none inline-flex h-9.5 items-center self-start rounded-full px-4.5 text-sm font-semibold"
                >Принять приглашение</span
              >
            </div>
          </details>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
            <org-button variant="line" size="sm" :disabled="busy" @click="ctl.toAsk()">Назад к решениям</org-button>
            <org-button :disabled="busy || !imp.summary.ready" @click="ctl.send()">
              Разослать {{ invitesText }}<ArrowRightIcon />
            </org-button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="abort" class="absolute inset-0 z-10 flex items-center justify-center p-6">
      <div
        ref="confirm"
        class="tile flex w-110 max-w-full flex-col gap-4 bg-paper shadow-[0_24px_64px_-16px_rgb(0_0_0/40%)]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="abort-title"
        aria-describedby="abort-text"
        tabindex="-1"
      >
        <h3 id="abort-title" class="text-xl font-bold">Прервать импорт?</h3>
        <p id="abort-text" class="text-sm text-ink-2">Файл не сохранится, придётся загрузить его заново</p>
        <div class="flex flex-wrap gap-3">
          <org-button size="sm" @click="abort = false">Продолжить</org-button>
          <org-button variant="line" size="sm" @click="ctl.cancel()">Прервать</org-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRightIcon, CheckIcon, FileSpreadsheetIcon, MoveRightIcon, XIcon } from '@lucide/vue'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import type { SpeakerImportRow } from '@/api/demo'
import { plural } from '@/components/org/format'
import OrgAvatar from '@/components/org/OrgAvatar.vue'
import OrgButton from '@/components/org/OrgButton.vue'
import { useModal } from '@/components/org/useModal'
import type { SpeakerImportController } from '@/components/org/useSpeakerImport'
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
const widths = ['min-w-45', 'min-w-50', 'min-w-35', 'min-w-35', 'min-w-65']
const statuses: Record<SpeakerImportRow['status'], { label: string; class: string }> = {
  will_invite: { label: 'Будет приглашён', class: 'fill-ink' },
  no_email: { label: 'Нет почты', class: 'fill-pink' },
  skipped: { label: 'Не приглашаем', class: 'tag-dash' },
}
const tones = ['mint', 'yellow', 'uv', 'orange', 'pink'] as const
const tone = (id: string) => {
  const t = tones[(Number.parseInt(id.replace(/\D/g, ''), 10) - 1) % tones.length] ?? 'mint'
  return t === 'uv' ? 'mint' : t
}

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
