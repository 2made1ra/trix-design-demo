// Эндпоинты, которых нет в api/openapi.yaml trix. Сигнатуры как у orval: { data, status, headers } через customFetch.
// Когда бэкенд получит эти методы, файл заменяет сгенерированный клиент без правок в страницах.

import { customFetch } from './fetcher'
import type { Error as ApiError, AuthResult, HTTPStatusCodes, PositionLevel } from './generated'

type Result<T, S extends number = 200> =
  | { data: T; status: S; headers: Headers }
  | { data: ApiError; status: Exclude<HTTPStatusCodes, S>; headers: Headers }

type Options = Parameters<typeof customFetch>[1]

const request = <T, S extends number = 200>(method: string, url: string, body?: unknown, options?: Options) =>
  customFetch<Result<T, S>>(url, {
    ...options,
    method,
    headers: body === undefined || body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined || body instanceof FormData ? (body as FormData | undefined) : JSON.stringify(body),
  })

const withQuery = (path: string, params: object = {}) => {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== '') query.append(key, String(value))
  const text = query.toString()
  return text ? `${path}?${text}` : path
}

// ---------- Мероприятия ----------

export interface EventTrack {
  name: string
  description: string
}

/** Треки мероприятия с описанием: в Conference их нет, на карточке они нужны. */
export async function listEventTracks(slug: string, options?: Options) {
  return request<EventTrack[]>('GET', `/api/conferences/c/${slug}/tracks`, undefined, options)
}

// ---------- Разбор доклада ----------

export type TalkReviewStatus = 'processing' | 'done' | 'failed'
export type TalkReviewStage = 'reading' | 'matching' | 'scoring'
export type CriterionState = 'ok' | 'improve' | 'weak'

export interface TalkReviewCriterion {
  id: string
  name: string
  state: CriterionState
}

export interface TalkReviewFix {
  id: string
  priority: 'high' | 'medium'
  title: string
  text: string
  /** Где в материалах: «Слайды 3–5», «Текст, абзац 3» */
  where: string
}

export interface TalkReviewQuestion {
  id: string
  question: string
  answer: string
}

export interface TalkReviewResult {
  summary: string
  criteria: TalkReviewCriterion[]
  fixes: TalkReviewFix[]
  questions: TalkReviewQuestion[]
}

export interface TalkReview {
  id: string
  status: TalkReviewStatus
  /** Этап обработки, пока статус processing */
  stage: TalkReviewStage | null
  title: string
  event: { slug: string; name: string }
  materials: string[]
  created_at: string
  error: ApiError | null
  result: TalkReviewResult | null
}

export interface TalkReviewInput {
  event_slug: string
  title?: string
  text?: string
  file?: File
}

export async function createTalkReview(input: TalkReviewInput, options?: Options) {
  const form = new FormData()
  form.set('event_slug', input.event_slug)
  if (input.title) form.set('title', input.title)
  if (input.text) form.set('text', input.text)
  if (input.file) form.set('file', input.file)
  return request<TalkReview, 201>('POST', '/api/talk-reviews', form, options)
}

export async function getTalkReview(id: string, options?: Options) {
  return request<TalkReview>('GET', `/api/talk-reviews/${id}`, undefined, options)
}

// ---------- Подключение организации и приглашение ----------

export interface OrgApplicationInput {
  name: string
  email: string
  site?: string
  consent: boolean
}

/** invite_token в ответе — демо-замена письма с приглашением. */
export interface OrgApplication {
  id: string
  invite_token: string
}

export async function createOrgApplication(input: OrgApplicationInput, options?: Options) {
  return request<OrgApplication, 201>('POST', '/api/org/applications', input, options)
}

export interface InviteInfo {
  organization_name: string
  email: string
  role: 'admin'
  /** Аккаунт с этой почтой уже есть: показываем вход вместо регистрации */
  account_exists: boolean
  /** Почта текущего аккаунта, если пользователь уже вошёл */
  current_email: string | null
}

export async function getInvite(token: string, options?: Options) {
  return request<InviteInfo>('GET', `/api/invites/${token}`, undefined, options)
}

export type AcceptInviteInput =
  | { mode: 'register'; first_name: string; password: string }
  | { mode: 'login'; password: string }
  | { mode: 'current' }

export async function acceptInvite(token: string, input: AcceptInviteInput, options?: Options) {
  return request<AuthResult>('POST', `/api/invites/${token}/accept`, input, options)
}

// ---------- Организация и её онбординг ----------

export interface TeamMember {
  email: string
  name?: string
  role: 'admin' | 'member'
  status: 'active' | 'invited'
}

export interface Organization {
  id: string
  name: string
  site: string | null
  direction_ids: string[]
  city_ids: string[]
  domains?: string[]
  team: TeamMember[]
  /** Текущий шаг онбординга 1–3, после завершения null */
  step: 1 | 2 | 3 | null
  onboarding_completed_at: string | null
}

export async function getOrganization(options?: Options) {
  return request<Organization>('GET', '/api/org', undefined, options)
}

export interface OrganizationProfileInput {
  name: string
  site?: string
  direction_ids: string[]
  city_ids: string[]
  domains?: string[]
}

/** Шаг 1: сохраняет профиль организации и открывает шаг 2. */
export async function saveOrganizationProfile(input: OrganizationProfileInput, options?: Options) {
  return request<Organization>('PUT', '/api/org/onboarding/profile', input, options)
}

/** Шаг 2: приглашает коллег, пустой список — пропуск шага. */
export async function inviteColleagues(input: { emails: string[] }, options?: Options) {
  return request<Organization>('POST', '/api/org/onboarding/team', input, options)
}

/** Шаг 3: завершает онбординг, в том числе когда файл не загружали. */
export async function completeOrganizationOnboarding(options?: Options) {
  return request<Organization>('POST', '/api/org/onboarding/complete', undefined, options)
}

// ---------- Импорт спикеров ----------

export type SpeakerImportStage = 'upload' | 'parse' | 'questions' | 'ready'

export interface ImportDirectionQuestion {
  id: string
  type: 'directions'
  title: string
  values: { id: string; raw: string; chosen: string; candidates: string[] }[]
  options: { id: string; name: string }[]
}

export interface ImportMissingEmailQuestion {
  id: string
  type: 'missing_email'
  title: string
  row_id: string
  person: string
}

export type SpeakerImportQuestion = ImportDirectionQuestion | ImportMissingEmailQuestion

export interface SpeakerImportRow {
  id: string
  name: string
  email: string | null
  city: string
  direction: string
  past_talks: { label: string; year: number | null }[]
  /** Исходный текст ячейки «Где выступал» */
  source_text: string
  status: 'will_invite' | 'no_email' | 'skipped'
}

export interface SpeakerImport {
  id: string
  file_name: string
  size_kb: number
  stage: SpeakerImportStage
  /** Что нашли при разборе, пока файл не прочитан — null */
  found: { rows: number; columns: number; talks: number } | null
  columns: { source: string; target: string }[]
  questions: SpeakerImportQuestion[]
  rows: SpeakerImportRow[]
  summary: { ready: number; no_email: number; skipped: number }
  sent_at: string | null
}

export async function createSpeakerImport(file: File, options?: Options) {
  const form = new FormData()
  form.set('file', file)
  return request<SpeakerImport, 201>('POST', '/api/org/speaker-imports', form, options)
}

export async function getSpeakerImport(id: string, options?: Options) {
  return request<SpeakerImport>('GET', `/api/org/speaker-imports/${id}`, undefined, options)
}

export interface SpeakerImportAnswers {
  /** id значения колонки «Стек» → id направления */
  directions?: Record<string, string>
  /** id строки → добавить почту или не приглашать */
  missing_email?: Record<string, { email: string } | { skip: true }>
}

export async function answerSpeakerImport(id: string, answers: SpeakerImportAnswers, options?: Options) {
  return request<SpeakerImport>('POST', `/api/org/speaker-imports/${id}/answers`, answers, options)
}

export async function sendSpeakerImportInvites(id: string, options?: Options) {
  return request<{ sent: number }>('POST', `/api/org/speaker-imports/${id}/send`, undefined, options)
}

export async function cancelSpeakerImport(id: string, options?: Options) {
  return request<undefined, 204>('DELETE', `/api/org/speaker-imports/${id}`, undefined, options)
}

// ---------- Спикеры организации ----------

export interface OrgSpeaker {
  id: string
  name: string
  position: string
  direction: { id: string; name: string }
  city: { id: string; name: string }
  level: PositionLevel | null
  talks_count: number
  /** NPS зала, у приглашённых нет */
  nps: number | null
  recommended: boolean
  status: 'active' | 'invited'
}

export interface OrgSpeakersParams {
  q?: string
  direction_id?: string
  city_id?: string
  level?: PositionLevel
  nps_min?: number
  talks_min?: number
}

export async function listOrgSpeakers(params?: OrgSpeakersParams, options?: Options) {
  return request<{ items: OrgSpeaker[]; total: number }>(
    'GET',
    withQuery('/api/org/speakers', params),
    undefined,
    options,
  )
}

// ---------- Выступления на подтверждение ----------

export interface PendingTalk {
  id: string
  speaker: { id: string; name: string; position: string }
  title: string
  kind: 'Конференция' | 'Митап' | 'Подкаст'
  date: string
  url: string
}

export async function listPendingTalks(options?: Options) {
  return request<{ items: PendingTalk[]; total: number }>('GET', '/api/org/pending-talks', undefined, options)
}

export interface ConfirmTalkInput {
  /** Оценка команды 1–5, спикер её не видит */
  score: 1 | 2 | 3 | 4 | 5
  recommend: boolean
}

export async function confirmPendingTalk(id: string, input: ConfirmTalkInput, options?: Options) {
  return request<OrgSpeaker>('POST', `/api/org/pending-talks/${id}/confirm`, input, options)
}

// ---------- Мероприятия организации ----------

export interface OrgEvent {
  id: string
  /** Slug мероприятия в общей подборке, у закрытых и добавленных вручную — null */
  slug: string | null
  name: string
  kind: 'Конференция' | 'Митап'
  city: string
  format: 'offline' | 'online' | 'hybrid'
  source: 'open' | 'own'
  starts_at: string
  deadline: string
  tracks: string[]
  min_level: PositionLevel | null
  offers_count: number
  is_open: boolean
}

export async function listOrgEvents(options?: Options) {
  return request<{ upcoming: OrgEvent[]; past: OrgEvent[] }>('GET', '/api/org/events', undefined, options)
}

export async function addOrgEvent(input: { url: string }, options?: Options) {
  return request<OrgEvent, 201>('POST', '/api/org/events', input, options)
}

// ---------- Кого позвать и предложения ----------

export type OfferStatus = 'sent' | 'accepted' | 'declined'

export interface Offer {
  id: string
  organization_name: string
  event: { id: string; slug: string | null; name: string }
  speaker: { id: string; name: string; position: string; city: string }
  track: string | null
  topic: string | null
  message: string
  answer_by: string
  status: OfferStatus
  sent_at: string
}

export interface Candidate {
  speaker: OrgSpeaker
  /** Почему подходит: шаблон по треку, уровню и NPS */
  reason: string
  offer: Offer | null
}

export async function listEventCandidates(eventId: string, options?: Options) {
  return request<{ event: OrgEvent; items: Candidate[] }>(
    'GET',
    `/api/org/events/${eventId}/candidates`,
    undefined,
    options,
  )
}

export interface OfferInput {
  speaker_id: string
  track?: string
  topic?: string
  message: string
  answer_by: string
}

export async function createOffer(eventId: string, input: OfferInput, options?: Options) {
  return request<Offer, 201>('POST', `/api/org/events/${eventId}/offers`, input, options)
}

export async function listMyOffers(options?: Options) {
  return request<{ items: Offer[] }>('GET', '/api/me/offers', undefined, options)
}

export async function acceptOffer(id: string, options?: Options) {
  return request<Offer>('POST', `/api/me/offers/${id}/accept`, undefined, options)
}

export async function declineOffer(id: string, options?: Options) {
  return request<Offer>('POST', `/api/me/offers/${id}/decline`, undefined, options)
}

// ---------- Служебное ----------

/** Очищает мок-базу и вход. Есть только в демо. */
export async function resetDemo(options?: Options) {
  return request<undefined, 204>('POST', '/api/demo/reset', undefined, options)
}
