import type { AuthResult, LoginInput, Onboarding, OnboardingInput, RegisterInput, User } from '@/api/generated'
import type { Account } from '../db'
import { type Ctx, created, fail, jsonBody, newId, nowIso, requireUser } from './http'

export const tokenOf = (account: Account) => `mock.${account.id}`

export const userView = (account: Account): User => ({
  id: account.id,
  profile_id: account.id,
  email: account.email,
  roles: account.roles,
  email_verified_at: account.created_at,
  onboarding_completed_at: account.onboarding_completed_at,
  created_at: account.created_at,
  updated_at: account.created_at,
})

export const authResult = (account: Account): AuthResult => ({ token: tokenOf(account), user: userView(account) })

const findByEmail = (ctx: Ctx, email: string) =>
  ctx.db.accounts.find((account) => account.email.toLowerCase() === email.trim().toLowerCase())

export const register = (ctx: Ctx) => {
  const input = jsonBody<RegisterInput>(ctx)
  if (!input.email?.includes('@') || (input.password?.length ?? 0) < 8 || !input.first_name || !input.role) {
    fail(400, 'bad_request')
  }
  if (findByEmail(ctx, input.email as string)) fail(409, 'email_taken')

  const account: Account = {
    id: newId('u'),
    email: (input.email as string).trim(),
    password: input.password as string,
    first_name: input.first_name as string,
    last_name: input.last_name ?? '',
    roles: [input.role as 'speaker' | 'devrel'],
    onboarding: null,
    onboarding_completed_at: null,
    created_at: nowIso(),
    org_id: null,
    work_emails: [],
  }
  ctx.db.accounts.push(account)
  return created(authResult(account))
}

export const login = (ctx: Ctx) => {
  const input = jsonBody<LoginInput>(ctx)
  const account = input.email ? findByEmail(ctx, input.email) : undefined
  if (!account || account.password !== input.password) fail(401, 'invalid_credentials')
  return authResult(account as Account)
}

export const getMe = (ctx: Ctx) => userView(requireUser(ctx))

const emptyOnboarding: Onboarding = {
  position_category_ids: [],
  speaking_experience: null,
  goal: null,
  preferred_city_id: null,
  preferred_formats: [],
  paid_only: false,
}

export const getOnboarding = (ctx: Ctx) => requireUser(ctx).onboarding ?? emptyOnboarding

export const completeOnboarding = (ctx: Ctx) => {
  const user = requireUser(ctx)
  const input = jsonBody<OnboardingInput>(ctx)
  if (!input.position_category_ids?.length || !input.speaking_experience || !input.goal) fail(400, 'bad_request')

  user.onboarding = {
    position_category_ids: input.position_category_ids as string[],
    speaking_experience: input.speaking_experience as Onboarding['speaking_experience'],
    goal: input.goal as Onboarding['goal'],
    preferred_city_id: input.preferred_city_id ?? null,
    preferred_formats: input.preferred_formats ?? [],
    paid_only: input.paid_only ?? false,
  }
  user.onboarding_completed_at ??= nowIso()
  return userView(user)
}

export const skipOnboarding = (ctx: Ctx) => {
  const user = requireUser(ctx)
  user.onboarding_completed_at ??= nowIso()
  return userView(user)
}
