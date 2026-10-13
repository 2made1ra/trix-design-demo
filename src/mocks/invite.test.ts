import { beforeEach, describe, expect, it } from 'vitest'
import {
  acceptInvite,
  createOrgApplication,
  getInvite,
  getOrganization,
  inviteColleagues,
  saveOrganizationProfile,
} from '@/api/demo'
import { reset } from './db'

describe('заявка организации и приглашение', () => {
  beforeEach(() => {
    reset()
    localStorage.removeItem('token')
  })

  const apply = async (email: string) => {
    const res = await createOrgApplication({ name: 'Орбита', email, site: 'https://orbita.example', consent: true })
    if (res.status !== 201) throw new Error(res.data.key)
    return res.data.invite_token
  }

  it('новая почта: регистрация по приглашению, онбординг идёт с шага 1 до 3', async () => {
    const token = await apply('it@orbita.example')
    const invite = await getInvite(token)
    expect(invite.data).toEqual({
      organization_name: 'Орбита',
      email: 'it@orbita.example',
      role: 'admin',
      account_exists: false,
      current_email: null,
    })

    const accepted = await acceptInvite(token, { mode: 'register', first_name: 'Ирина', password: 'password-1' })
    if (accepted.status !== 200) throw new Error(accepted.data.key)
    expect(accepted.data.user.roles).toEqual(['devrel'])
    localStorage.setItem('token', accepted.data.token)

    const org = await getOrganization()
    expect(org.data).toMatchObject({ name: 'Орбита', step: 1, team: [{ email: 'it@orbita.example', role: 'admin' }] })

    const step1 = await saveOrganizationProfile({
      name: 'Орбита',
      direction_ids: ['pc-backend'],
      city_ids: ['city-msk'],
    })
    expect(step1.data).toMatchObject({ step: 2 })
    const step2 = await inviteColleagues({ emails: ['colleague@orbita.example'] })
    expect(step2.data).toMatchObject({ step: 3 })
    expect((await getInvite(token)).status).toBe(410)
  })

  it('почта существующего аккаунта: нужен вход, неверный пароль отклоняется', async () => {
    const token = await apply('speaker@demo.trix')
    expect((await getInvite(token)).data).toMatchObject({ account_exists: true })

    const wrong = await acceptInvite(token, { mode: 'login', password: 'wrong-password' })
    expect(wrong.status).toBe(401)
  })

  it('устаревшая ссылка отвечает 410, неизвестная — 404', async () => {
    expect((await getInvite('expired')).status).toBe(410)
    expect((await getInvite('nope')).status).toBe(404)
  })
})
