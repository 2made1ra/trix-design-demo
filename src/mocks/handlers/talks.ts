import type { TalkReview, TalkReviewStage } from '@/api/demo'
import type { StoredReview } from '../db'
import { buildReviewResult, DEFAULT_TALK_TITLE } from '../seed/review'
import { type Ctx, created, fail, formBody, newId, requireUser } from './http'

// Разбор идёт во времени: статус считается из момента создания, фронт опрашивает раз в 1–2 с.
export const REVIEW_DURATION_MS = 6000
const STAGE_MS = REVIEW_DURATION_MS / 3
const SCAN_FAIL_MS = 2000
const STAGES: TalkReviewStage[] = ['reading', 'matching', 'scoring']

const isUnreadableScan = (review: StoredReview) =>
  !review.text.trim() && !!review.file_name?.toLowerCase().includes('scan')

const view = (ctx: Ctx, review: StoredReview): TalkReview => {
  const event = ctx.db.events.find((item) => item.conference.slug === review.event_slug)
  const age = Date.now() - review.created_ms
  const base = {
    id: review.id,
    title: review.title,
    event: { slug: review.event_slug, name: event?.conference.name ?? '' },
    materials: [review.text.trim() && 'текст выступления', review.file_name].filter((item): item is string => !!item),
    created_at: new Date(review.created_ms).toISOString(),
  }

  if (isUnreadableScan(review)) {
    return age < SCAN_FAIL_MS
      ? { ...base, status: 'processing', stage: 'reading', error: null, result: null }
      : {
          ...base,
          status: 'failed',
          stage: null,
          error: { key: 'text_not_extracted', message: 'Не удалось извлечь текст из файла' },
          result: null,
        }
  }
  if (age < REVIEW_DURATION_MS) {
    return {
      ...base,
      status: 'processing',
      stage: STAGES[Math.min(Math.floor(age / STAGE_MS), 2)],
      error: null,
      result: null,
    }
  }
  return {
    ...base,
    status: 'done',
    stage: null,
    error: null,
    result: buildReviewResult(
      event?.conference.name ?? '',
      event?.tracks[0].name ?? 'Архитектура',
      event?.conference.talk_minutes ?? 30,
    ),
  }
}

export const createTalkReview = (ctx: Ctx) => {
  const user = requireUser(ctx)
  const form = formBody(ctx)
  const slug = String(form.get('event_slug') ?? '')
  if (!ctx.db.events.some((event) => event.conference.slug === slug)) fail(404, 'conference_not_found')

  const text = String(form.get('text') ?? '')
  const file = form.get('file')
  const fileName = file instanceof File ? file.name : null
  if (!text.trim() && !fileName) fail(400, 'invalid_material')

  const review: StoredReview = {
    id: newId('tr'),
    owner_id: user.id,
    event_slug: slug,
    title: String(form.get('title') ?? '').trim() || DEFAULT_TALK_TITLE,
    text,
    file_name: fileName,
    created_ms: Date.now(),
  }
  ctx.db.reviews.push(review)
  return created(view(ctx, review))
}

export const getTalkReview = (ctx: Ctx) => {
  const user = requireUser(ctx)
  const review = ctx.db.reviews.find((item) => item.id === ctx.params.id && item.owner_id === user.id)
  return view(ctx, review ?? fail(404, 'talk_review_not_found'))
}
