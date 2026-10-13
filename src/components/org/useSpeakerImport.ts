import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  answerSpeakerImport,
  cancelSpeakerImport,
  completeOrganizationOnboarding,
  createSpeakerImport,
  getSpeakerImport,
  type ImportDirectionQuestion,
  type ImportMissingEmailQuestion,
  type SpeakerImport,
  type SpeakerImportAnswers,
  sendSpeakerImportInvites,
} from '@/api/demo'
import { useAuth } from '@/composables/useAuth'

export type ImportStage = 'upload' | 'parse' | 'ask' | 'review'
export type MailDecision = { kind: 'open' } | { kind: 'mail'; email: string } | { kind: 'skip' }

export type ImportState =
  | { kind: 'idle' }
  | { kind: 'creating'; fileName: string }
  | { kind: 'running'; imp: SpeakerImport; view: 'ask' | 'review'; q: number; busy: boolean }
  | { kind: 'failed'; message: string }
  | { kind: 'sent'; sent: number }

const POLL_MS = 1000
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Машина импорта: этап берётся из статуса на сервере (upload → parse → questions → ready), локально хранятся только
// выбор в окне (вопрос, «назад к решениям») и черновик ответов.
export const useSpeakerImport = () => {
  const { loadOrg } = useAuth()
  const state = ref<ImportState>({ kind: 'idle' })
  const dirs = reactive<Record<string, string>>({})
  const mails = reactive<Record<string, MailDecision>>({})
  let timer = 0
  // Номер запуска: ответ запроса от прерванного импорта игнорируется.
  let run = 0

  const stopPoll = () => clearTimeout(timer)
  // Черновики принадлежат одному импорту: ответы прошлого файла не должны попасть в следующий.
  const clearDrafts = () => {
    for (const key of Object.keys(dirs)) delete dirs[key]
    for (const key of Object.keys(mails)) delete mails[key]
  }
  onBeforeUnmount(() => {
    run++
    stopPoll()
  })

  const stage = computed<ImportStage | null>(() => {
    const s = state.value
    if (s.kind === 'creating') return 'upload'
    if (s.kind !== 'running') return null
    if (s.imp.stage === 'upload' || s.imp.stage === 'parse') return s.imp.stage
    return s.view
  })

  const questions = computed(() => (state.value.kind === 'running' ? state.value.imp.questions : []))
  const dirQuestion = (q: (typeof questions.value)[number] | undefined) => (q?.type === 'directions' ? q : null)
  const mailQuestion = (q: (typeof questions.value)[number] | undefined) => (q?.type === 'missing_email' ? q : null)
  const current = computed(() => {
    const s = state.value
    return s.kind === 'running' ? s.imp.questions[s.q] : undefined
  })
  const currentDirections = computed<ImportDirectionQuestion | null>(() => dirQuestion(current.value))
  const currentMail = computed<ImportMissingEmailQuestion | null>(() => mailQuestion(current.value))
  const unresolved = computed(() =>
    questions.value.some((q) => q.type === 'missing_email' && (mails[q.row_id]?.kind ?? 'open') === 'open'),
  )

  const seedDrafts = (imp: SpeakerImport) => {
    for (const q of imp.questions) {
      if (q.type === 'directions') for (const v of q.values) dirs[v.id] ??= v.chosen
      else mails[q.row_id] ??= { kind: 'open' }
    }
  }

  const apply = (imp: SpeakerImport) => {
    const s = state.value
    if (s.kind === 'running') {
      s.imp = imp
      return
    }
    state.value = { kind: 'running', imp, view: 'ask', q: 0, busy: false }
  }

  const poll = (id: string, mine: number) => {
    timer = window.setTimeout(async () => {
      const res = await getSpeakerImport(id)
      if (mine !== run) return
      if (res.status !== 200) {
        state.value = { kind: 'failed', message: res.data.message }
        return
      }
      apply(res.data)
      if (res.data.stage === 'upload' || res.data.stage === 'parse') poll(id, mine)
      else seedDrafts(res.data)
    }, POLL_MS)
  }

  const start = async (file: File) => {
    const mine = ++run
    stopPoll()
    clearDrafts()
    state.value = { kind: 'creating', fileName: file.name }
    const res = await createSpeakerImport(file)
    if (mine !== run) {
      if (res.status === 201) await cancelSpeakerImport(res.data.id)
      return
    }
    if (res.status !== 201) {
      state.value = { kind: 'failed', message: res.data.message }
      return
    }
    state.value = { kind: 'running', imp: res.data, view: 'ask', q: 0, busy: false }
    if (res.data.stage === 'upload' || res.data.stage === 'parse') poll(res.data.id, mine)
    else seedDrafts(res.data)
  }

  const reset = () => {
    run++
    stopPoll()
    clearDrafts()
    state.value = { kind: 'idle' }
  }

  // «Отменить» и «Прервать»: файл не сохраняется.
  const cancel = async () => {
    const s = state.value
    reset()
    if (s.kind === 'running') await cancelSpeakerImport(s.imp.id)
  }

  const go = (q: number) => {
    const s = state.value
    if (s.kind === 'running') s.q = Math.max(0, Math.min(q, s.imp.questions.length - 1))
  }

  const setDirection = (valueId: string, directionId: string) => {
    dirs[valueId] = directionId
  }

  // Ответ по строке без почты: почта проверяется до отправки, пустое значение невозможно.
  const decideMail = (rowId: string, email: string) => {
    const value = email.trim()
    if (!EMAIL.test(value)) return false
    mails[rowId] = { kind: 'mail', email: value }
    return true
  }
  const skipMail = (rowId: string) => {
    mails[rowId] = { kind: 'skip' }
  }
  const reopenMail = (rowId: string) => {
    mails[rowId] = { kind: 'open' }
  }

  const answers = (): SpeakerImportAnswers => {
    const missing: NonNullable<SpeakerImportAnswers['missing_email']> = {}
    for (const [rowId, decision] of Object.entries(mails)) {
      if (decision.kind === 'mail') missing[rowId] = { email: decision.email }
      if (decision.kind === 'skip') missing[rowId] = { skip: true }
    }
    return { directions: { ...dirs }, missing_email: missing }
  }

  // Ответы уходят одним запросом: сервер пересчитывает превью и переводит импорт в «Проверку».
  const toReview = async () => {
    const s = state.value
    if (s.kind !== 'running' || unresolved.value) return
    s.busy = true
    const res = await answerSpeakerImport(s.imp.id, answers())
    s.busy = false
    if (res.status !== 200) return void toast.error(res.data.message)
    s.imp = res.data
    s.view = 'review'
  }

  const toAsk = () => {
    const s = state.value
    if (s.kind !== 'running') return
    s.view = 'ask'
    s.q = Math.max(0, s.imp.questions.length - 1)
  }

  const send = async () => {
    const s = state.value
    if (s.kind !== 'running' || s.busy) return
    s.busy = true
    const res = await sendSpeakerImportInvites(s.imp.id)
    if (res.status !== 200) {
      s.busy = false
      return void toast.error(res.data.message)
    }
    const done = await completeOrganizationOnboarding()
    if (done.status !== 200) toast.error(done.data.message)
    await loadOrg()
    state.value = { kind: 'sent', sent: res.data.sent }
  }

  return {
    state,
    stage,
    questions,
    current,
    currentDirections,
    currentMail,
    unresolved,
    dirs,
    mails,
    start,
    reset,
    cancel,
    go,
    setDirection,
    decideMail,
    skipMail,
    reopenMail,
    toReview,
    toAsk,
    send,
  }
}

export type SpeakerImportController = ReturnType<typeof useSpeakerImport>
