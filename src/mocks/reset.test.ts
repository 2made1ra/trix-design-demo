import { beforeEach, describe, expect, it } from 'vitest'
import { resetDemo } from '@/api/demo'
import { listCities, register } from '@/api/generated'
import { getDb, reset } from './db'
import { createSeed } from './seed'
import { signInSpeaker } from './test-helpers'

describe('сброс демо', () => {
  beforeEach(() => reset())

  it('сид содержит данные по спеке', () => {
    const db = getDb()
    expect(db.events).toHaveLength(20)
    expect(db.events.filter((event) => event.conference.source === 'import')).toHaveLength(16)
    expect(db.events.every((event) => Date.parse(event.cfp.closes_at) > Date.parse('2026-10-16'))).toBe(true)
    expect(db.speakers).toHaveLength(30)
    expect(db.speakers.filter((speaker) => speaker.status === 'invited')).toHaveLength(4)
    expect(db.pendingTalks).toHaveLength(3)
    expect(db.orgEvents).toHaveLength(5)
  })

  it('resetDemo возвращает сид и разлогинивает', async () => {
    await signInSpeaker()
    const created = await register({
      email: 'new@example.org',
      password: 'password-1',
      username: 'newbie',
      first_name: 'Новый',
      last_name: 'Спикер',
      role: 'speaker',
    })
    expect(created.status).toBe(201)
    expect(getDb().accounts).toHaveLength(3)
    expect(localStorage.getItem('trix-demo:db')).toContain('new@example.org')

    const res = await resetDemo()
    expect(res.status).toBe(204)
    expect(getDb()).toEqual(createSeed())
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('справочники отдаются без входа', async () => {
    const res = await listCities({ q: 'каз' })
    expect(res.data).toEqual([{ id: 'city-kzn', name: 'Казань', country: 'Россия', slug: 'kazan' }])
  })
})
