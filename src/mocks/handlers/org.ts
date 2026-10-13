import type {
  AcceptInviteInput,
  InviteInfo,
  OrgApplication,
  OrgApplicationInput,
  Organization,
  OrganizationProfileInput,
} from '@/api/demo'
import type { Account, StoredOrg } from '../db'
import { authResult } from './auth'
import { type Ctx, created, fail, jsonBody, newId, nowIso, requireOrg, requireUser } from './http'

const MIN_PASSWORD = 8
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const orgView = (org: StoredOrg): Organization => ({
  id: org.id,
  name: org.name,
  site: org.site,
  direction_ids: org.direction_ids,
  city_ids: org.city_ids,
  domains: org.domains ?? [],
  team: org.team,
  step: org.step,
  onboarding_completed_at: org.completed_at,
})

export const createOrgApplication = (ctx: Ctx) => {
  const input = jsonBody<OrgApplicationInput>(ctx)
  if (!input.name?.trim() || !input.email || !emailPattern.test(input.email) || input.consent !== true) {
    fail(400, 'bad_request')
  }

  const application = {
    id: newId('app'),
    name: (input.name as string).trim(),
    email: (input.email as string).trim(),
    site: input.site?.trim() || null,
    created_at: nowIso(),
  }
  const token = newId('inv')
  ctx.db.applications.push(application)
  ctx.db.invites.push({
    token,
    email: application.email,
    organization_name: application.name,
    site: application.site,
    used: false,
  })
  const result: OrgApplication = { id: application.id, invite_token: token }
  return created(result)
}

const inviteOf = (ctx: Ctx) => {
  const invite = ctx.db.invites.find((item) => item.token === ctx.params.token) ?? fail(404, 'invite_not_found')
  if (invite.used) fail(410, 'invite_expired')
  return invite
}

const findByEmail = (ctx: Ctx, email: string) =>
  ctx.db.accounts.find((account) => account.email.toLowerCase() === email.toLowerCase())

export const getInvite = (ctx: Ctx): InviteInfo => {
  const invite = inviteOf(ctx)
  return {
    organization_name: invite.organization_name,
    email: invite.email,
    role: 'admin',
    account_exists: !!findByEmail(ctx, invite.email),
    current_email: ctx.user?.email ?? null,
  }
}

export const acceptInvite = (ctx: Ctx) => {
  const invite = inviteOf(ctx)
  const input = jsonBody<AcceptInviteInput>(ctx) as Partial<{ mode: string; first_name: string; password: string }>
  let account: Account

  if (input.mode === 'register') {
    if (findByEmail(ctx, invite.email)) fail(409, 'email_taken')
    if (!input.first_name?.trim() || (input.password?.length ?? 0) < MIN_PASSWORD) fail(400, 'bad_request')
    account = {
      id: newId('u'),
      email: invite.email,
      password: input.password as string,
      first_name: (input.first_name as string).trim(),
      last_name: '',
      roles: [],
      onboarding: null,
      onboarding_completed_at: nowIso(),
      created_at: nowIso(),
      org_id: null,
      work_emails: [],
    }
    ctx.db.accounts.push(account)
  } else if (input.mode === 'login') {
    const found = findByEmail(ctx, invite.email)
    if (!found || found.password !== input.password) fail(401, 'invalid_credentials')
    account = found as Account
  } else if (input.mode === 'current') {
    account = requireUser(ctx)
    if (account.email.toLowerCase() !== invite.email.toLowerCase()) account.work_emails.push(invite.email)
  } else {
    return fail(400, 'bad_request')
  }

  const org: StoredOrg = {
    id: newId('org'),
    name: invite.organization_name,
    site: invite.site,
    direction_ids: [],
    city_ids: [],
    team: [
      {
        email: invite.email,
        name: [account.first_name, account.last_name].filter(Boolean).join(' '),
        role: 'admin',
        status: 'active',
      },
    ],
    step: 1,
    completed_at: null,
  }
  ctx.db.organizations.push(org)
  account.org_id = org.id
  if (!account.roles.includes('devrel')) account.roles.push('devrel')
  invite.used = true
  return authResult(account)
}

export const getOrganization = (ctx: Ctx) => orgView(requireOrg(ctx))

export const saveOrganizationProfile = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const input = jsonBody<OrganizationProfileInput>(ctx)
  if (!input.name?.trim() || !input.direction_ids?.length || !input.city_ids?.length) fail(400, 'bad_request')

  org.name = (input.name as string).trim()
  org.site = input.site?.trim() || null
  org.direction_ids = input.direction_ids as string[]
  org.city_ids = input.city_ids as string[]
  org.domains = input.domains ?? []
  if (org.step === 1) org.step = 2
  return orgView(org)
}

export const inviteColleagues = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const emails = jsonBody<{ emails: string[] }>(ctx).emails ?? []
  if (emails.some((email) => !emailPattern.test(email))) fail(400, 'bad_request')

  for (const email of emails) {
    if (!org.team.some((member) => member.email.toLowerCase() === email.toLowerCase())) {
      org.team.push({ email, role: 'member', status: 'invited' })
    }
  }
  if (org.step === 2) org.step = 3
  return orgView(org)
}

export const completeOrganizationOnboarding = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  org.step = null
  org.completed_at ??= nowIso()
  return orgView(org)
}
