import type {
  City,
  Conference,
  ConferenceKind,
  EventFormat,
  OnboardingGoal,
  PositionLevel,
  SpeakingExperience,
} from '@/api/generated'

// Подписи и разбор данных мероприятий для страниц спикера.

export const kindLabels: Record<ConferenceKind, string> = {
  conference: 'Конференция',
  meetup: 'Митап',
  workshop: 'Воркшоп',
  other: 'Мероприятие',
}
export const levelLabels: Record<PositionLevel, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
  head: 'Head',
  c_level: 'C-level',
}
export const formatLabels: Record<EventFormat, string> = { offline: 'Офлайн', online: 'Онлайн', hybrid: 'Гибрид' }
export const experienceLabels: Record<SpeakingExperience, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  experienced: 'Опытный',
}
export const goalLabels: Record<OnboardingGoal, string> = { speak: 'Выступать', grow: 'Прокачаться' }

const date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const shortDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const dateYear = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatDate = (iso: string) => date.format(new Date(iso))
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso))
export const formatDateYear = (iso: string) => dateYear.format(new Date(iso))

/** Даты проведения: «18–19 февраля 2027» или «19 декабря 2026» */
export const formatRange = (startAt: string, endAt: string) => {
  const [start, end] = [new Date(startAt), new Date(endAt)]
  if (start.toDateString() === end.toDateString()) return dateYear.format(start)
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear())
    return `${start.getDate()}–${dateYear.format(end)}`
  return `${date.format(start)} – ${dateYear.format(end)}`
}

export const paidLabel = (paid: boolean | null) =>
  paid === null ? 'Оплата не указана' : paid ? 'Оплачивается' : 'Не оплачивается'

/** Город и формат считаем по секциям: онлайн-секция и очная секция вместе дают гибрид */
export const conferencePlace = (conference: Conference, cities: City[]) => {
  const online = conference.sections.some((section) => section.is_online)
  const offline = conference.sections.filter((section) => !section.is_online)
  const names = offline.map((section) => cities.find((city) => city.id === section.city_id)?.name ?? section.name)
  const format: EventFormat = online && offline.length ? 'hybrid' : online ? 'online' : 'offline'
  return { city: names[0], cities: names, format }
}

/** Заявку принимает сам TRIX только у мероприятий организаторов; остальные собраны из открытых источников */
export const isTrixSource = (conference: Conference) => conference.source === 'manual'
