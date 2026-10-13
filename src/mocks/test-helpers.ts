import { login, type OnboardingInput } from '@/api/generated'
import { DEMO_ADMIN_EMAIL, DEMO_PASSWORD, DEMO_SPEAKER_EMAIL } from './seed/accounts'

export const signIn = async (email: string) => {
  const res = await login({ email, password: DEMO_PASSWORD })
  if (res.status !== 200) throw new Error(`login failed: ${res.data.key}`)
  localStorage.setItem('token', res.data.token)
  return res.data.user
}

export const signInSpeaker = () => signIn(DEMO_SPEAKER_EMAIL)
export const signInAdmin = () => signIn(DEMO_ADMIN_EMAIL)

export const onboarding = (overrides: Partial<OnboardingInput> = {}): OnboardingInput => ({
  position_category_ids: ['pc-backend'],
  speaking_experience: 'experienced',
  goal: 'speak',
  preferred_city_id: null,
  preferred_formats: [],
  paid_only: false,
  ...overrides,
})
