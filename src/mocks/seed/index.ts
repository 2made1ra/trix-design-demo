import type { Offer, TeamMember } from '@/api/demo'
import type { Onboarding, UserRole } from '@/api/generated'
import type { Db } from '../db'
import { DEMO_ADMIN_EMAIL, DEMO_PASSWORD, DEMO_SPEAKER_EMAIL } from './accounts'
import { buildEvents } from './events'
import { buildOrgEvents, buildPendingTalks, buildSpeakers } from './speakers'

const DEMO_ORG_ID = 'org-demo'
const COMPLETED_AT = '2026-10-01T10:00:00Z'

const speakerOnboarding: Onboarding = {
  position_category_ids: ['pc-backend', 'pc-devops'],
  speaking_experience: 'experienced',
  goal: 'speak',
  preferred_city_id: 'city-msk',
  preferred_formats: ['offline', 'online'],
  paid_only: false,
}

const account = (id: string, email: string, first: string, last: string, roles: UserRole[], orgId: string | null) => ({
  id,
  email,
  password: DEMO_PASSWORD,
  first_name: first,
  last_name: last,
  roles,
  onboarding: roles.includes('speaker') ? speakerOnboarding : null,
  onboarding_completed_at: COMPLETED_AT,
  created_at: '2026-09-15T10:00:00Z',
  org_id: orgId,
  work_emails: [] as string[],
})

const team: TeamMember[] = [{ email: DEMO_ADMIN_EMAIL, name: 'Евгений Крылов', role: 'admin', status: 'active' }]

const seedOffer = (
  id: string,
  eventId: string,
  eventSlug: string,
  eventName: string,
  speakerId: string,
  name: string,
  position: string,
  city: string,
  status: Offer['status'],
  day: string,
) => ({
  id,
  org_id: DEMO_ORG_ID,
  organization_name: 'Северный контур',
  event: { id: eventId, slug: eventSlug, name: eventName },
  speaker: { id: speakerId, name, position, city },
  track: null,
  topic: null,
  message: `${name.split(' ')[0]}, добрый день. Нам хочется услышать вас на «${eventName}». Если тема и формат подходят, подтвердите участие.`,
  answer_by: '2026-11-05',
  status,
  sent_at: `2026-10-${day}T09:00:00Z`,
})

export const createSeed = (): Db => ({
  accounts: [
    account('u-speaker', DEMO_SPEAKER_EMAIL, 'Мария', 'Седова', ['speaker'], null),
    account('u-admin', DEMO_ADMIN_EMAIL, 'Евгений', 'Крылов', ['devrel'], DEMO_ORG_ID),
  ],
  organizations: [
    {
      id: DEMO_ORG_ID,
      name: 'Северный контур',
      site: 'https://severny-kontur.example.org',
      direction_ids: ['pc-backend', 'pc-data', 'pc-devops', 'pc-frontend'],
      city_ids: ['city-msk', 'city-spb', 'city-kzn', 'city-nsk', 'city-ekb'],
      team,
      step: null,
      completed_at: COMPLETED_AT,
    },
  ],
  invites: [
    { token: 'expired', email: 'ex@company.ru', organization_name: 'Старая организация', site: null, used: true },
  ],
  applications: [],
  events: buildEvents(),
  reviews: [],
  imports: [],
  speakers: buildSpeakers(DEMO_ORG_ID),
  pendingTalks: buildPendingTalks(DEMO_ORG_ID),
  orgEvents: buildOrgEvents(DEMO_ORG_ID),
  offers: [
    seedOffer(
      'of-1',
      'oe-1',
      'highload-systems-2027',
      'Конференция о высоконагруженных системах',
      'sp-06',
      'Дмитрий Лебедев',
      'Старший DevOps-инженер',
      'Санкт-Петербург',
      'sent',
      '05',
    ),
    seedOffer(
      'of-2',
      'oe-1',
      'highload-systems-2027',
      'Конференция о высоконагруженных системах',
      'sp-09',
      'Алексей Беляев',
      'Руководитель платформенной команды',
      'Санкт-Петербург',
      'declined',
      '03',
    ),
    seedOffer(
      'of-3',
      'oe-3',
      'data-conf-kazan',
      'Конференция о данных',
      'sp-01',
      'Анна Ковалёва',
      'Руководитель группы данных',
      'Казань',
      'sent',
      '07',
    ),
  ],
})
