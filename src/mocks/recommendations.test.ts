import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { completeOnboarding, listRecommendations } from '@/api/generated'
import { reset } from './db'
import { onboarding, signInSpeaker } from './test-helpers'

const slugs = async () => {
  const res = await listRecommendations()
  if (res.status !== 200) throw new Error(res.data.key)
  return res.data.items.map((item) => item.conference.slug)
}

describe('подборка мероприятий', () => {
  beforeEach(async () => {
    reset()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-20T12:00:00Z'))
    await signInSpeaker()
  })
  afterEach(() => vi.useRealTimers())

  it('не содержит мероприятий с прошедшим дедлайном', async () => {
    await completeOnboarding(onboarding())
    const result = await slugs()
    // Дедлайны этих мероприятий раньше 20 ноября.
    expect(result).not.toContain('go-meetup-kazan')
    expect(result).not.toContain('highload-systems-2027')
    expect(result).toContain('service-reliability-2027')
    expect(result).toHaveLength(12)
  })

  it('город и формат: офлайн в Казани оставляет одно мероприятие', async () => {
    await completeOnboarding(onboarding({ preferred_city_id: 'city-kzn', preferred_formats: ['offline'] }))
    expect(await slugs()).toEqual(['data-conf-kazan'])
  })

  it('формат «онлайн»: остаются мероприятия с онлайн-секцией, сфера Backend выше', async () => {
    await completeOnboarding(onboarding({ preferred_formats: ['online'] }))
    expect(await slugs()).toEqual([
      'service-reliability-2027',
      'south-tech-fest',
      'analytics-online-conf',
      'mobile-practice-spb',
      'product-conf-2027',
    ])
  })

  it('paid_only оставляет только оплачиваемые, без «оплата не указана»', async () => {
    await completeOnboarding(onboarding({ paid_only: true }))
    const res = await listRecommendations()
    if (res.status !== 200) throw new Error(res.data.key)
    expect(res.data.items.every((item) => item.conference.is_paid === true)).toBe(true)
    expect(res.data.items.map((item) => item.conference.slug)).not.toContain('mobile-practice-spb')
  })

  it('ставит выше мероприятия под выбранную сферу и объясняет причину', async () => {
    await completeOnboarding(onboarding({ position_category_ids: ['pc-data'] }))
    const res = await listRecommendations()
    if (res.status !== 200) throw new Error(res.data.key)
    expect(res.data.items[0].conference.slug).toBe('data-conf-kazan')
    expect(res.data.items[0].reason).toBe('ваша сфера «Data и ML» совпадает с треком «Инженерия данных».')
  })
})
