import type { Offer, SpeakerImportAnswers, TeamMember } from '@/api/demo'
import type { Onboarding, UserRole } from '@/api/generated'
import { createSeed } from './seed'
import type { DemoEvent } from './seed/events'
import type { StoredOrgEvent, StoredPendingTalk, StoredSpeaker } from './seed/speakers'

const STORAGE_KEY = 'trix-demo:db'

export interface Account {
  id: string
  email: string
  password: string
  first_name: string
  last_name: string
  roles: UserRole[]
  onboarding: Onboarding | null
  onboarding_completed_at: string | null
  created_at: string
  org_id: string | null
  /** Рабочие почты организаций, добавленные в этот аккаунт по приглашению */
  work_emails: string[]
}

export interface StoredOrg {
  id: string
  name: string
  site: string | null
  direction_ids: string[]
  city_ids: string[]
  domains?: string[]
  team: TeamMember[]
  step: 1 | 2 | 3 | null
  completed_at: string | null
}

export interface StoredInvite {
  token: string
  email: string
  organization_name: string
  site: string | null
  used: boolean
}

export interface StoredApplication {
  id: string
  name: string
  email: string
  site: string | null
  created_at: string
}

export interface StoredReview {
  id: string
  owner_id: string
  event_slug: string
  title: string
  text: string
  file_name: string | null
  /** Время создания в мс: по нему вычисляется статус разбора */
  created_ms: number
}

export interface StoredImport {
  id: string
  org_id: string
  file_name: string
  size_kb: number
  created_ms: number
  answers: SpeakerImportAnswers
  sent_at: string | null
  cancelled: boolean
}

export type StoredOffer = Offer & { org_id: string }

export interface Db {
  accounts: Account[]
  organizations: StoredOrg[]
  invites: StoredInvite[]
  applications: StoredApplication[]
  events: DemoEvent[]
  reviews: StoredReview[]
  imports: StoredImport[]
  speakers: StoredSpeaker[]
  pendingTalks: StoredPendingTalk[]
  orgEvents: StoredOrgEvent[]
  offers: StoredOffer[]
}

let state: Db | null = null

const load = (): Db => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch {
    // Повреждённая или недоступная база: начинаем с сида.
  }
  return createSeed()
}

export const getDb = (): Db => {
  state ??= load()
  return state
}

export const saveDb = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getDb()))
  } catch {
    // Хранилище переполнено или закрыто: демо продолжает работать в памяти.
  }
}

/** Возвращает сид и разлогинивает. */
export const reset = () => {
  state = createSeed()
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('token')
  } catch {
    // Без хранилища чистить нечего.
  }
}
