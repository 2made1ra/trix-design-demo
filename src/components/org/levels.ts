import type { PositionLevel } from '@/api/generated'

export const levelNames: Record<PositionLevel, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
  head: 'Head',
  c_level: 'C-level',
}

export const levelOptions = Object.entries(levelNames).map(([value, label]) => ({
  value: value as PositionLevel,
  label,
}))

const tones = ['mint', 'yellow', 'pink', 'orange', 'lime'] as const

/** Цвет аватара не меняется между перерисовками: берётся от кода имени. */
export const toneOf = (name: string) =>
  tones[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length] ?? 'mint'
