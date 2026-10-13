import type { Candidate, ConfirmTalkInput, Offer, OfferInput, OrgEvent, OrgSpeaker } from '@/api/demo'
import type { PositionLevel } from '@/api/generated'
import type { StoredOffer } from '../db'
import { cities, directions } from '../seed/dictionaries'
import type { StoredOrgEvent, StoredSpeaker } from '../seed/speakers'
import { type Ctx, created, fail, jsonBody, newId, nowIso, requireOrg, requireUser } from './http'

const MAX_CANDIDATES = 6
const MIN_SCORE = 1
const MAX_SCORE = 5
const DAY_MS = 86_400_000
const levelOrder: PositionLevel[] = ['junior', 'middle', 'senior', 'lead', 'head', 'c_level']
const levelTitle: Partial<Record<PositionLevel, string>> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
}

const nameOf = <T extends { id: string; name: string }>(list: T[], id: string) =>
  list.find((item) => item.id === id)?.name ?? ''

export const speakerView = (speaker: StoredSpeaker): OrgSpeaker => ({
  id: speaker.id,
  name: speaker.name,
  position: speaker.position,
  direction: { id: speaker.direction_id, name: nameOf(directions, speaker.direction_id) },
  city: { id: speaker.city_id, name: nameOf(cities, speaker.city_id) },
  level: speaker.level,
  talks_count: speaker.talks_count,
  nps: speaker.nps,
  recommended: speaker.recommended,
  status: speaker.status,
})

export const listOrgSpeakers = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const { query } = ctx
  const q = query.get('q')?.trim().toLowerCase()
  const npsMin = query.get('nps_min')
  const talksMin = query.get('talks_min')
  const all = ctx.db.speakers.filter((speaker) => speaker.org_id === org.id)
  const items = all
    .filter((speaker) => !q || `${speaker.name} ${speaker.position}`.toLowerCase().includes(q))
    .filter((speaker) => !query.get('direction_id') || speaker.direction_id === query.get('direction_id'))
    .filter((speaker) => !query.get('city_id') || speaker.city_id === query.get('city_id'))
    .filter((speaker) => !query.get('level') || speaker.level === query.get('level'))
    .filter((speaker) => !npsMin || (speaker.nps !== null && speaker.nps >= Number(npsMin)))
    .filter((speaker) => !talksMin || speaker.talks_count >= Number(talksMin))
  return { items: items.map(speakerView), total: all.length }
}

export const listPendingTalks = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const items = ctx.db.pendingTalks.filter((talk) => talk.org_id === org.id && !talk.confirmed)
  return { items: items.map(({ org_id: _org, confirmed: _confirmed, ...talk }) => talk), total: items.length }
}

export const confirmPendingTalk = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const talk = ctx.db.pendingTalks.find(
    (item) => item.id === ctx.params.id && item.org_id === org.id && !item.confirmed,
  )
  const { score, recommend } = jsonBody<ConfirmTalkInput>(ctx)
  if (!talk) fail(404, 'talk_not_found')
  if (!Number.isInteger(score) || (score as number) < MIN_SCORE || (score as number) > MAX_SCORE)
    fail(400, 'bad_request')

  const speaker = ctx.db.speakers.find((item) => item.id === talk?.speaker.id) ?? fail(404, 'speaker_not_found')
  ;(talk as { confirmed: boolean }).confirmed = true
  speaker.talks_count += 1
  speaker.status = 'active'
  if (recommend) speaker.recommended = true
  return speakerView(speaker)
}

const eventView = (ctx: Ctx, event: StoredOrgEvent): OrgEvent => {
  const { org_id: _org, ...rest } = event
  const now = Date.now()
  return {
    ...rest,
    offers_count: ctx.db.offers.filter((offer) => offer.event.id === event.id).length,
    is_open: Date.parse(`${event.deadline}T23:59:59Z`) >= now && Date.parse(`${event.starts_at}T00:00:00Z`) >= now,
  }
}

export const listOrgEvents = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const events = ctx.db.orgEvents.filter((event) => event.org_id === org.id).map((event) => eventView(ctx, event))
  const isPast = (event: OrgEvent) => Date.parse(`${event.starts_at}T00:00:00Z`) < Date.now()
  return { upcoming: events.filter((event) => !isPast(event)), past: events.filter(isPast) }
}

export const addOrgEvent = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const { url } = jsonBody<{ url: string }>(ctx)
  let host = ''
  try {
    const parsed = new URL(url ?? '')
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('protocol')
    host = parsed.hostname
  } catch {
    fail(400, 'invalid_url')
  }

  const day = (offset: number) => new Date(Date.now() + offset * DAY_MS).toISOString().slice(0, 10)
  const event: StoredOrgEvent = {
    id: newId('oe'),
    org_id: org.id,
    slug: null,
    name: `Мероприятие ${host}`,
    kind: 'Конференция',
    city: 'Москва',
    format: 'offline',
    source: 'open',
    starts_at: day(90),
    deadline: day(45),
    tracks: [],
    min_level: null,
    offers_count: 0,
    is_open: true,
  }
  ctx.db.orgEvents.push(event)
  return created(eventView(ctx, event))
}

const offerView = ({ org_id: _org, ...offer }: StoredOffer): Offer => offer

const reasonFor = (speaker: StoredSpeaker, track: string) => {
  const direction = nameOf(directions, speaker.direction_id)
  const tail = speaker.recommended
    ? `в команде отмечен «Рекомендую», NPS зала ${speaker.nps?.toFixed(1)}`
    : (speaker.nps ?? 0) >= 9
      ? `NPS зала ${speaker.nps?.toFixed(1)}, уровень ${levelTitle[speaker.level as PositionLevel] ?? 'не указан'}`
      : `${speaker.talks_count} выступлений, есть опыт конференций`
  return `Направление «${direction}» совпадает с треком «${track}», ${tail}.`
}

export const listEventCandidates = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const event =
    ctx.db.orgEvents.find((item) => item.id === ctx.params.id && item.org_id === org.id) ?? fail(404, 'event_not_found')
  const spheres = ctx.db.events.find((item) => item.conference.slug === event.slug)?.spheres ?? []
  const minLevel = event.min_level ? levelOrder.indexOf(event.min_level) : 0
  const track = event.tracks[0] ?? event.name

  const items: Candidate[] = ctx.db.speakers
    .filter((speaker) => speaker.org_id === org.id && speaker.status === 'active')
    .filter((speaker) => spheres.length === 0 || spheres.includes(speaker.direction_id))
    .filter((speaker) => levelOrder.indexOf(speaker.level ?? 'junior') >= minLevel)
    .sort((a, b) => Number(b.recommended) - Number(a.recommended) || (b.nps ?? 0) - (a.nps ?? 0))
    .slice(0, MAX_CANDIDATES)
    .map((speaker) => ({
      speaker: speakerView(speaker),
      reason: reasonFor(speaker, track),
      offer:
        ctx.db.offers
          .filter((offer) => offer.event.id === event.id && offer.speaker.id === speaker.id)
          .map(offerView)[0] ?? null,
    }))
  return { event: eventView(ctx, event), items }
}

export const createOffer = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const event =
    ctx.db.orgEvents.find((item) => item.id === ctx.params.id && item.org_id === org.id) ?? fail(404, 'event_not_found')
  const input = jsonBody<OfferInput>(ctx)
  const speaker =
    ctx.db.speakers.find((item) => item.id === input.speaker_id && item.org_id === org.id) ??
    fail(404, 'speaker_not_found')
  if (!input.message?.trim() || !input.answer_by) fail(400, 'bad_request')
  if (
    ctx.db.offers.some(
      (offer) => offer.event.id === event.id && offer.speaker.id === speaker.id && offer.status !== 'declined',
    )
  ) {
    fail(409, 'offer_exists')
  }

  const offer: StoredOffer = {
    id: newId('of'),
    org_id: org.id,
    organization_name: org.name,
    event: { id: event.id, slug: event.slug, name: event.name },
    speaker: { id: speaker.id, name: speaker.name, position: speaker.position, city: nameOf(cities, speaker.city_id) },
    track: input.track ?? null,
    topic: input.topic?.trim() || null,
    message: (input.message as string).trim(),
    answer_by: input.answer_by as string,
    status: 'sent',
    sent_at: nowIso(),
  }
  ctx.db.offers.push(offer)
  return created(offerView(offer))
}

// Предложение приходит спикеру-аккаунту, который привязан к спикеру организации по почте.
const myOffers = (ctx: Ctx) => {
  const user = requireUser(ctx)
  const emails = [user.email, ...user.work_emails].map((email) => email.toLowerCase())
  const ids = ctx.db.speakers
    .filter((speaker) => speaker.account_email && emails.includes(speaker.account_email))
    .map((speaker) => speaker.id)
  return ctx.db.offers.filter((offer) => ids.includes(offer.speaker.id))
}

export const listMyOffers = (ctx: Ctx) => ({ items: myOffers(ctx).map(offerView) })

const answerOffer = (ctx: Ctx, status: 'accepted' | 'declined') => {
  const offer = myOffers(ctx).find((item) => item.id === ctx.params.id) ?? fail(404, 'offer_not_found')
  if (offer.status !== 'sent') fail(409, 'offer_answered')
  offer.status = status
  return offerView(offer)
}

export const acceptOffer = (ctx: Ctx) => answerOffer(ctx, 'accepted')
export const declineOffer = (ctx: Ctx) => answerOffer(ctx, 'declined')
