import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  answerSpeakerImport,
  createSpeakerImport,
  getSpeakerImport,
  listOrgSpeakers,
  type SpeakerImportAnswers,
  sendSpeakerImportInvites,
} from '@/api/demo'
import { reset } from './db'
import { signInAdmin } from './test-helpers'

const file = () => new File(['x'.repeat(2048)], 'спикеры_2026.xlsx')

const current = async (id: string) => {
  const res = await getSpeakerImport(id)
  if (res.status !== 200) throw new Error(res.data.key)
  return res.data
}

const startImport = async () => {
  const res = await createSpeakerImport(file())
  if (res.status !== 201) throw new Error(res.data.key)
  vi.advanceTimersByTime(4000)
  return res.data.id
}

describe('импорт спикеров', () => {
  beforeEach(async () => {
    reset()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-13T10:00:00Z'))
    await signInAdmin()
  })
  afterEach(() => vi.useRealTimers())

  it('идёт upload → parse → questions', async () => {
    const created = await createSpeakerImport(file())
    if (created.status !== 201) throw new Error(created.data.key)
    const { id } = created.data
    expect(created.data).toMatchObject({ file_name: 'спикеры_2026.xlsx', size_kb: 2, stage: 'upload', found: null })

    vi.advanceTimersByTime(1500)
    expect(await current(id)).toMatchObject({ stage: 'parse', found: { rows: 6, columns: 5, talks: 9 } })

    vi.advanceTimersByTime(2500)
    const ready = await current(id)
    expect(ready.stage).toBe('questions')
    expect(ready.questions.map((question) => question.id)).toEqual(['directions', 'missing-email'])
    expect(ready.summary).toEqual({ ready: 5, no_email: 1, skipped: 0 })
  })

  it('после ответов с почтой готово 6 строк', async () => {
    const id = await startImport()
    const res = await answerSpeakerImport(id, {
      directions: { 'v-1': 'pc-data', 'v-2': 'pc-mobile' },
      missing_email: { 'row-6': { email: 'p.lebedev@company.ru' } },
    })
    if (res.status !== 200) throw new Error(res.data.key)
    expect(res.data.stage).toBe('ready')
    expect(res.data.summary).toEqual({ ready: 6, no_email: 0, skipped: 0 })
    expect(res.data.rows[5]).toMatchObject({ email: 'p.lebedev@company.ru', status: 'will_invite' })
  })

  it('«не приглашать» исключает строку: готово 5', async () => {
    const id = await startImport()
    const res = await answerSpeakerImport(id, {
      directions: { 'v-1': 'pc-backend', 'v-2': 'pc-mobile' },
      missing_email: { 'row-6': { skip: true } },
    })
    if (res.status !== 200) throw new Error(res.data.key)
    expect(res.data.summary).toEqual({ ready: 5, no_email: 0, skipped: 1 })
    // Ответ на первый вопрос меняет направление строки Ильи Морозова.
    expect(res.data.rows[1].direction).toBe('Backend')
  })

  it('рассылка добавляет 5 приглашённых спикеров, повторная отклоняется', async () => {
    const before = await listOrgSpeakers()
    if (before.status !== 200) throw new Error(before.data.key)
    expect(before.data.total).toBe(30)

    const id = await startImport()
    expect((await sendSpeakerImportInvites(id)).status).toBe(409)
    await answerSpeakerImport(id, {
      directions: { 'v-1': 'pc-data', 'v-2': 'pc-mobile' },
      missing_email: { 'row-6': { skip: true } },
    })

    const sent = await sendSpeakerImportInvites(id)
    if (sent.status !== 200) throw new Error(sent.data.key)
    expect(sent.data).toEqual({ sent: 5 })
    expect((await sendSpeakerImportInvites(id)).status).toBe(409)

    const after = await listOrgSpeakers({ q: 'Ковалёва' })
    if (after.status !== 200) throw new Error(after.data.key)
    expect(after.data.total).toBe(35)
    expect(after.data.items.map((speaker) => [speaker.name, speaker.status])).toEqual([
      ['Анна Ковалёва', 'active'],
      ['Анна Ковалёва', 'invited'],
    ])
  })

  it('повторная рассылка того же файла не дублирует спикеров', async () => {
    const answers: SpeakerImportAnswers = {
      directions: { 'v-1': 'pc-data', 'v-2': 'pc-mobile' },
      missing_email: { 'row-6': { skip: true } },
    }
    const first = await startImport()
    await answerSpeakerImport(first, answers)
    const firstSent = await sendSpeakerImportInvites(first)
    if (firstSent.status !== 200) throw new Error(firstSent.data.key)
    expect(firstSent.data).toEqual({ sent: 5 })

    const second = await startImport()
    await answerSpeakerImport(second, answers)
    const secondSent = await sendSpeakerImportInvites(second)
    if (secondSent.status !== 200) throw new Error(secondSent.data.key)
    expect(secondSent.data).toEqual({ sent: 0 })

    const after = await listOrgSpeakers()
    if (after.status !== 200) throw new Error(after.data.key)
    expect(after.data.total).toBe(35)
  })

  it('без входа импорт недоступен', async () => {
    localStorage.removeItem('token')
    expect((await createSpeakerImport(file())).status).toBe(401)
  })
})
