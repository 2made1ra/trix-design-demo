import type { OrgEvent } from '@/api/demo'

export const formatNames: Record<OrgEvent['format'], string> = { offline: 'Очно', online: 'Онлайн', hybrid: 'Гибрид' }

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
