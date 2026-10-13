import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTalkReview, getTalkReview } from '@/api/demo'
import { reset } from './db'
import { signInSpeaker } from './test-helpers'

const SLUG = 'highload-systems-2027'

const status = async (id: string) => {
  const res = await getTalkReview(id)
  if (res.status !== 200) throw new Error(res.data.key)
  return res.data
}

describe('разбор доклада', () => {
  beforeEach(async () => {
    reset()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-13T10:00:00Z'))
    await signInSpeaker()
  })
  afterEach(() => vi.useRealTimers())

  it('проходит processing → done и отдаёт фикстуру разбора', async () => {
    const created = await createTalkReview({ event_slug: SLUG, text: 'Текст выступления про миграцию' })
    if (created.status !== 201) throw new Error(created.data.key)
    const { id } = created.data

    let review = await status(id)
    expect(review.status).toBe('processing')
    expect(review.stage).toBe('reading')
    expect(review.result).toBeNull()

    vi.advanceTimersByTime(2500)
    expect((await status(id)).stage).toBe('matching')

    vi.advanceTimersByTime(3500)
    review = await status(id)
    expect(review.status).toBe('done')
    expect(review.title).toBe('Миграция монолита без остановки сервиса')
    expect(review.event).toEqual({ slug: SLUG, name: 'Конференция о высоконагруженных системах' })
    expect(review.result?.criteria.map((item) => item.state)).toEqual(['improve', 'ok', 'improve', 'weak'])
    expect(review.result?.fixes).toHaveLength(4)
    expect(review.result?.questions).toHaveLength(4)
    expect(review.result?.summary).toContain('«Архитектура и миграции»')
  })

  it('scan.pdf без текста даёт failed с ключом text_not_extracted', async () => {
    const file = new File(['%PDF'], 'scan.pdf', { type: 'application/pdf' })
    const created = await createTalkReview({ event_slug: SLUG, file })
    if (created.status !== 201) throw new Error(created.data.key)

    vi.advanceTimersByTime(2500)
    const review = await status(created.data.id)
    expect(review.status).toBe('failed')
    expect(review.error?.key).toBe('text_not_extracted')
    expect(review.result).toBeNull()
  })

  it('отклоняет пустой материал и неизвестное мероприятие', async () => {
    const empty = await createTalkReview({ event_slug: SLUG })
    expect([empty.status, empty.data]).toMatchObject([400, { key: 'invalid_material' }])

    const unknown = await createTalkReview({ event_slug: 'nope', text: 'текст' })
    expect(unknown.status).toBe(404)
  })
})
