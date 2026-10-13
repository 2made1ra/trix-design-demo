import { getDb, reset, saveDb } from './db'
import * as auth from './handlers/auth'
import * as events from './handlers/events'
import { ApiError, type Ctx, type Handler, noContent, Reply } from './handlers/http'
import * as imports from './handlers/imports'
import * as org from './handlers/org'
import * as orgData from './handlers/orgData'
import * as talks from './handlers/talks'

const MIN_LATENCY_MS = 250
const MAX_LATENCY_MS = 600

const resetDemo: Handler = () => {
  reset()
  return noContent()
}

const routes: [method: string, path: string, handler: Handler][] = [
  ['POST', '/api/auth/register', auth.register],
  ['POST', '/api/auth/login', auth.login],
  ['GET', '/api/me', auth.getMe],
  ['GET', '/api/me/onboarding', auth.getOnboarding],
  ['PUT', '/api/me/onboarding', auth.completeOnboarding],
  ['POST', '/api/me/onboarding/skip', auth.skipOnboarding],
  ['GET', '/api/me/recommendations', events.listRecommendations],
  ['GET', '/api/cities', events.listCities],
  ['GET', '/api/position-categories', events.listPositionCategories],
  ['GET', '/api/cfps', events.listCFPs],
  ['GET', '/api/conferences/c/:slug', events.getConferenceBySlug],
  ['GET', '/api/conferences/c/:slug/tracks', events.listEventTracks],

  ['POST', '/api/talk-reviews', talks.createTalkReview],
  ['GET', '/api/talk-reviews/:id', talks.getTalkReview],

  ['POST', '/api/org/applications', org.createOrgApplication],
  ['GET', '/api/invites/:token', org.getInvite],
  ['POST', '/api/invites/:token/accept', org.acceptInvite],
  ['GET', '/api/org', org.getOrganization],
  ['PUT', '/api/org/onboarding/profile', org.saveOrganizationProfile],
  ['POST', '/api/org/onboarding/team', org.inviteColleagues],
  ['POST', '/api/org/onboarding/complete', org.completeOrganizationOnboarding],

  ['POST', '/api/org/speaker-imports', imports.createSpeakerImport],
  ['GET', '/api/org/speaker-imports/:id', imports.getSpeakerImport],
  ['POST', '/api/org/speaker-imports/:id/answers', imports.answerSpeakerImport],
  ['POST', '/api/org/speaker-imports/:id/send', imports.sendSpeakerImportInvites],
  ['DELETE', '/api/org/speaker-imports/:id', imports.cancelSpeakerImport],

  ['GET', '/api/org/speakers', orgData.listOrgSpeakers],
  ['GET', '/api/org/pending-talks', orgData.listPendingTalks],
  ['POST', '/api/org/pending-talks/:id/confirm', orgData.confirmPendingTalk],
  ['GET', '/api/org/events', orgData.listOrgEvents],
  ['POST', '/api/org/events', orgData.addOrgEvent],
  ['GET', '/api/org/events/:id/candidates', orgData.listEventCandidates],
  ['POST', '/api/org/events/:id/offers', orgData.createOffer],
  ['GET', '/api/me/offers', orgData.listMyOffers],
  ['POST', '/api/me/offers/:id/accept', orgData.acceptOffer],
  ['POST', '/api/me/offers/:id/decline', orgData.declineOffer],

  ['POST', '/api/demo/reset', resetDemo],
]

const matchers = routes.map(([method, path, handler]) => ({
  method,
  handler,
  pattern: new RegExp(`^${path.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`),
}))

const respond = (status: number, data?: unknown) =>
  new Response(data === undefined ? null : JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const parseBody = (body: RequestInit['body']): unknown => {
  if (body instanceof FormData) return body
  if (typeof body !== 'string' || !body) return undefined
  try {
    return JSON.parse(body)
  } catch {
    return undefined
  }
}

// Токен мока имеет вид «mock.<id аккаунта>», после сброса демо он перестаёт подходить.
const userOf = (headers: Headers) => {
  const id = headers.get('Authorization')?.replace('Bearer mock.', '')
  return getDb().accounts.find((account) => account.id === id) ?? null
}

/** Подменяет fetch: ходит в моковую базу вместо сети, но отвечает настоящим Response. */
export const mockFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // В тестах задержка не нужна, а с поддельными таймерами она бы подвесила запрос.
  if (import.meta.env.MODE !== 'test') await wait(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS))

  const { pathname, searchParams } = new URL(url, 'http://mock.local')
  const method = (options.method ?? 'GET').toUpperCase()
  const route = matchers.find((item) => item.method === method && item.pattern.test(pathname))
  if (!route) return respond(404, { key: 'not_found', message: 'Не найдено' })

  const ctx: Ctx = {
    params: { ...route.pattern.exec(pathname)?.groups },
    query: searchParams,
    body: parseBody(options.body),
    user: userOf(new Headers(options.headers)),
    db: getDb(),
  }

  try {
    const result = route.handler(ctx)
    saveDb()
    return result instanceof Reply ? respond(result.status, result.data) : respond(200, result)
  } catch (error) {
    if (error instanceof ApiError) return respond(error.status, { key: error.key, message: error.key })
    console.error(error)
    return respond(500, { key: 'internal_error', message: 'Внутренняя ошибка сервера' })
  }
}
