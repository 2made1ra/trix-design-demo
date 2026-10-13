import { reactive } from 'vue'
import type { EventFormat, OnboardingGoal, SpeakingExperience } from '@/api/generated'

// Ответы онбординга живут между шагами: каждый шаг — отдельный маршрут, страница пересоздаётся.
export const draft = reactive({
  sphereId: null as string | null,
  experience: null as SpeakingExperience | null,
  goal: null as OnboardingGoal | null,
  topic: '',
  cityId: null as string | null,
  formats: [] as EventFormat[],
  paidOnly: false,
})
