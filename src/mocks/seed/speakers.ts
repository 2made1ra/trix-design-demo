import type { OrgEvent, PendingTalk } from '@/api/demo'
import type { PositionLevel } from '@/api/generated'
import { DEMO_SPEAKER_EMAIL } from './accounts'
import { cityByName, directionByName } from './dictionaries'

export interface StoredSpeaker {
  id: string
  org_id: string
  name: string
  email: string | null
  /** Аккаунт, которому приходят предложения спикера */
  account_email: string | null
  position: string
  direction_id: string
  city_id: string
  level: PositionLevel | null
  talks_count: number
  nps: number | null
  recommended: boolean
  status: 'active' | 'invited'
}

type Row = [
  name: string,
  position: string,
  direction: string,
  city: string,
  level: PositionLevel,
  talks: number,
  nps: number | null,
  recommended: boolean,
]

// У приглашённых выступлений и оценок нет: они появятся после первого подтверждённого выступления.
const rows: Row[] = [
  ['Анна Ковалёва', 'Руководитель группы данных', 'Data и ML', 'Казань', 'senior', 6, 9.7, true],
  ['Илья Морозов', 'Тимлид ML-платформы', 'Data и ML', 'Москва', 'senior', 5, 9.5, true],
  ['Мария Седова', 'Архитектор', 'Backend', 'Москва', 'lead', 8, 9.3, true],
  ['Сергей Орлов', 'Инженер платформы', 'Backend', 'Москва', 'senior', 4, 9.0, false],
  ['Елена Власова', 'Frontend-разработчик', 'Frontend', 'Новосибирск', 'middle', 2, 9.1, false],
  ['Дмитрий Лебедев', 'Старший DevOps-инженер', 'DevOps', 'Санкт-Петербург', 'middle', 3, 8.8, false],
  ['Ольга Тихонова', 'Продуктовый аналитик', 'Data и ML', 'Санкт-Петербург', 'junior', 0, null, false],
  ['Павел Громов', 'Backend-разработчик', 'Backend', 'Екатеринбург', 'middle', 0, null, false],
  ['Алексей Беляев', 'Руководитель платформенной команды', 'Backend', 'Санкт-Петербург', 'lead', 7, 9.2, true],
  ['Наталья Крылова', 'Ведущий frontend-разработчик', 'Frontend', 'Москва', 'senior', 5, 9.4, true],
  ['Игорь Фомин', 'Инженер по надёжности', 'DevOps', 'Москва', 'senior', 6, 9.0, false],
  ['Екатерина Самойлова', 'Руководитель QA', 'QA', 'Казань', 'lead', 4, 8.9, false],
  ['Артём Назаров', 'Мобильный разработчик', 'Mobile', 'Санкт-Петербург', 'middle', 3, 8.6, false],
  ['Виктория Жукова', 'Продуктовый менеджер', 'Продукт', 'Москва', 'senior', 4, 9.1, false],
  ['Максим Родионов', 'Инженер данных', 'Data и ML', 'Новосибирск', 'middle', 2, 8.4, false],
  ['Татьяна Савельева', 'Аналитик', 'Аналитика', 'Екатеринбург', 'middle', 3, 8.7, false],
  ['Роман Исаев', 'Специалист по безопасности приложений', 'Безопасность', 'Москва', 'senior', 5, 9.3, true],
  ['Юлия Андреева', 'Frontend-разработчик', 'Frontend', 'Казань', 'junior', 1, 8.2, false],
  ['Константин Дьячков', 'Backend-разработчик', 'Backend', 'Нижний Новгород', 'middle', 3, 8.5, false],
  ['Светлана Мельникова', 'Руководитель мобильной разработки', 'Mobile', 'Москва', 'lead', 6, 9.0, false],
  ['Владимир Ершов', 'Инженер по автотестированию', 'QA', 'Санкт-Петербург', 'middle', 2, 8.3, false],
  ['Дарья Киселёва', 'ML-инженер', 'Data и ML', 'Томск', 'middle', 3, 8.9, false],
  ['Никита Ларионов', 'DevOps-инженер', 'DevOps', 'Краснодар', 'junior', 1, 8.0, false],
  ['Полина Воронова', 'Продуктовый аналитик', 'Аналитика', 'Москва', 'senior', 4, 9.2, false],
  ['Георгий Тарасов', 'Архитектор данных', 'Data и ML', 'Москва', 'lead', 7, 9.4, true],
  ['Анастасия Щербакова', 'Backend-разработчик', 'Backend', 'Самара', 'middle', 2, 8.1, false],
  ['Олег Пименов', 'Инженер по безопасности', 'Безопасность', 'Санкт-Петербург', 'middle', 2, 8.5, false],
  ['Кирилл Захаров', 'Frontend-разработчик', 'Frontend', 'Тюмень', 'middle', 0, null, false],
  ['Валерия Комарова', 'Руководитель продукта', 'Продукт', 'Санкт-Петербург', 'senior', 0, null, false],
  ['Станислав Борисов', 'Backend-разработчик', 'Backend', 'Казань', 'senior', 3, 8.8, false],
]

const INVITED = new Set(['Ольга Тихонова', 'Павел Громов', 'Кирилл Захаров', 'Валерия Комарова'])

export const buildSpeakers = (orgId: string): StoredSpeaker[] =>
  rows.map(([name, position, direction, city, level, talks, nps, recommended], index) => ({
    id: `sp-${String(index + 1).padStart(2, '0')}`,
    org_id: orgId,
    name,
    email: null,
    account_email: name === 'Мария Седова' ? DEMO_SPEAKER_EMAIL : null,
    position,
    direction_id: directionByName(direction).id,
    city_id: cityByName(city).id,
    level,
    talks_count: talks,
    nps,
    recommended,
    status: INVITED.has(name) ? 'invited' : 'active',
  }))

export interface StoredPendingTalk extends PendingTalk {
  org_id: string
  confirmed: boolean
}

export const buildPendingTalks = (orgId: string): StoredPendingTalk[] => [
  {
    id: 'pt-1',
    org_id: orgId,
    speaker: { id: 'sp-02', name: 'Илья Морозов', position: 'Тимлид ML-платформы' },
    title: 'LLM в проде: что сломалось',
    kind: 'Подкаст',
    date: '2026-09-24',
    url: 'https://podcast.example.org/llm-v-prode',
    confirmed: false,
  },
  {
    id: 'pt-2',
    org_id: orgId,
    speaker: { id: 'sp-01', name: 'Анна Ковалёва', position: 'Руководитель группы данных' },
    title: 'Признаки для рекомендаций на лету',
    kind: 'Митап',
    date: '2026-10-02',
    url: 'https://meetup.example.org/data-features',
    confirmed: false,
  },
  {
    id: 'pt-3',
    org_id: orgId,
    speaker: { id: 'sp-03', name: 'Мария Седова', position: 'Архитектор' },
    title: 'Откат без простоя',
    kind: 'Конференция',
    date: '2026-10-08',
    url: 'https://conf.example.org/rollback-program',
    confirmed: false,
  },
]

export type StoredOrgEvent = OrgEvent & { org_id: string }

export const buildOrgEvents = (orgId: string): StoredOrgEvent[] => [
  {
    id: 'oe-1',
    org_id: orgId,
    slug: 'highload-systems-2027',
    name: 'Конференция о высоконагруженных системах',
    kind: 'Конференция',
    city: 'Москва',
    format: 'offline',
    source: 'open',
    starts_at: '2027-02-18',
    deadline: '2026-11-15',
    tracks: ['Архитектура и миграции', 'Нагрузка и масштабирование'],
    min_level: 'middle',
    offers_count: 0,
    is_open: true,
  },
  {
    id: 'oe-2',
    org_id: orgId,
    slug: 'backend-internal-meetup',
    name: 'Внутренний митап бэкенда',
    kind: 'Митап',
    city: 'Москва',
    format: 'hybrid',
    source: 'own',
    starts_at: '2026-11-27',
    deadline: '2026-11-03',
    tracks: ['Практики команды'],
    min_level: null,
    offers_count: 0,
    is_open: true,
  },
  {
    id: 'oe-3',
    org_id: orgId,
    slug: 'data-conf-kazan',
    name: 'Конференция о данных',
    kind: 'Конференция',
    city: 'Казань',
    format: 'offline',
    source: 'open',
    starts_at: '2027-03-26',
    deadline: '2026-11-25',
    tracks: ['Инженерия данных', 'ML в продукте'],
    min_level: 'middle',
    offers_count: 0,
    is_open: true,
  },
  {
    id: 'oe-4',
    org_id: orgId,
    slug: 'service-reliability-2027',
    name: 'Конференция по надёжности сервисов',
    kind: 'Конференция',
    city: 'Санкт-Петербург',
    format: 'hybrid',
    source: 'open',
    starts_at: '2027-03-12',
    deadline: '2026-12-01',
    tracks: ['Наблюдаемость', 'Инциденты и постмортемы'],
    min_level: 'middle',
    offers_count: 0,
    is_open: true,
  },
  {
    id: 'oe-5',
    org_id: orgId,
    slug: null,
    name: 'Весенний митап платформенной команды',
    kind: 'Митап',
    city: 'Москва',
    format: 'offline',
    source: 'own',
    starts_at: '2026-04-16',
    deadline: '2026-03-30',
    tracks: ['Платформа'],
    min_level: null,
    offers_count: 0,
    is_open: false,
  },
]
