import type { Cfp, City, Conference, PositionCategory, Recommendation } from '@/api/generated'
import { cities, directions } from '../seed/dictionaries'
import { type Ctx, fail, requireUser } from './http'

const cfpView = (cfp: Cfp): Cfp => ({ ...cfp, is_open: Date.parse(cfp.closes_at) >= Date.now() })

const eventOf = (ctx: Ctx, slug: string) =>
  ctx.db.events.find((event) => event.conference.slug === slug) ?? fail(404, 'conference_not_found')

export const getConferenceBySlug = (ctx: Ctx): Conference => eventOf(ctx, ctx.params.slug).conference

export const listEventTracks = (ctx: Ctx) => eventOf(ctx, ctx.params.slug).tracks

export const listCFPs = (ctx: Ctx): { items: Cfp[]; next_cursor: null } => {
  const conferenceId = ctx.query.get('conference_id')
  const q = ctx.query.get('q')?.toLowerCase()
  const now = Date.now()
  const items = ctx.db.events
    .map((event) => cfpView(event.cfp))
    .filter((cfp) => !conferenceId || cfp.conference.id === conferenceId)
    .filter((cfp) => !q || cfp.title.toLowerCase().includes(q) || cfp.conference.name.toLowerCase().includes(q))
    .filter(
      (cfp) =>
        ctx.query.get('open') === null || Date.parse(cfp.closes_at) >= now === (ctx.query.get('open') === 'true'),
    )
  return { items, next_cursor: null }
}

export const listCities = (ctx: Ctx): City[] => {
  const q = ctx.query.get('q')?.toLowerCase()
  return cities.filter((city) => !q || city.name.toLowerCase().includes(q))
}

export const listPositionCategories = (): PositionCategory[] => directions

// Подборка: прошедший дедлайн, чужой город и формат, неоплачиваемые при paid_only отсекаются кодом, сфера влияет на порядок.
export const listRecommendations = (ctx: Ctx): { items: Recommendation[] } => {
  const onboarding = requireUser(ctx).onboarding
  const spheres = onboarding?.position_category_ids ?? []
  const formats = onboarding?.preferred_formats ?? []
  const cityId = onboarding?.preferred_city_id ?? null
  const wantOnline = formats.length === 0 || formats.includes('online') || formats.includes('hybrid')
  const wantOffline = formats.length === 0 || formats.includes('offline') || formats.includes('hybrid')
  const now = Date.now()

  const items = ctx.db.events
    .filter(({ cfp }) => Date.parse(cfp.closes_at) >= now)
    .filter(({ conference }) => !onboarding?.paid_only || conference.is_paid === true)
    .filter(({ conference }) => {
      const online = wantOnline && conference.sections.some((section) => section.is_online)
      const offline =
        wantOffline &&
        conference.sections.some((section) => !section.is_online && (!cityId || section.city_id === cityId))
      return online || offline
    })
    .map((event) => {
      const matched = directions.find(
        (direction) => spheres.includes(direction.id) && event.spheres.includes(direction.id),
      )
      const track = event.tracks[0].name
      const recommendation: Recommendation = {
        conference: event.conference,
        cfp: cfpView(event.cfp),
        topics: [...new Set([track, matched?.name])].filter((topic): topic is string => !!topic).slice(0, 3),
        reason: matched
          ? `ваша сфера «${matched.name}» совпадает с треком «${track}».`
          : `подходит по формату и городу, трек «${track}».`,
        application_status: null,
      }
      return { recommendation, matched: !!matched, deadline: Date.parse(event.cfp.closes_at) }
    })
    .sort((a, b) => Number(b.matched) - Number(a.matched) || a.deadline - b.deadline)
    .map(({ recommendation }) => recommendation)

  return { items }
}
