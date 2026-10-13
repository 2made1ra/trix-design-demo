<template>
  <app-onboarding-frame :big="`0${step}`" sub="/03">
    <template #float>
      <span class="kicker text-ink-2">Шаг {{ step }} из 3</span>
      <div
        role="progressbar"
        aria-label="Заполнение профиля"
        aria-valuemin="0"
        aria-valuemax="3"
        :aria-valuenow="step"
        class="grid grid-cols-3 gap-1.5"
      >
        <span v-for="n in 3" :key="n" class="h-1 rounded-sm" :class="n <= step ? 'bg-ink' : 'bg-line'" />
      </div>
      <p class="text-sm text-ink-2">{{ current.hint }}</p>
    </template>

    <div class="flex flex-col gap-4" data-rv>
      <h1 class="shout text-d1">{{ current.title }}</h1>
      <p class="text-xl leading-[1.55] text-ink-2">{{ current.lead }}</p>
    </div>

    <form class="flex flex-col gap-12" novalidate @submit.prevent="next">
      <template v-if="step === 1">
        <fieldset class="m-0 min-w-0 border-0 p-0" data-rv>
          <legend class="idx kicker text-ink-2">01 / Сфера</legend>
          <div v-if="dict.kind === 'loading'" class="flex flex-wrap gap-2" role="status">
            <span class="sr-only">Загружаем список сфер</span>
            <span
              v-for="w in [112, 120, 96, 118, 104, 64, 110, 96, 122]"
              :key="w"
              class="sk"
              :style="{ width: `${w}px` }"
            />
          </div>
          <div v-else-if="dict.kind === 'error'" class="alert alert-soft" role="alert">
            <CircleAlert />
            <p class="text-sm">Не удалось загрузить список сфер. Проверьте соединение и попробуйте ещё раз.</p>
            <button type="button" class="b b-ink b-sm" @click="loadDictionaries">Повторить</button>
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <label v-for="category in dict.categories" :key="category.id" class="pick">
              <input v-model="draft.sphereId" type="radio" name="sphere" :value="category.id">
              {{ category.name }}
            </label>
          </div>
        </fieldset>

        <fieldset class="m-0 min-w-0 border-0 p-0" data-rv>
          <legend class="idx kicker text-ink-2">02 / Опыт выступлений</legend>
          <div class="lvls">
            <label v-for="(level, i) in levels" :key="level.value" class="lvl">
              <input v-model="draft.experience" type="radio" name="level" :value="level.value">
              <span class="lvl-tick"><Check /></span>
              <span class="flex h-5.5 items-end gap-1" aria-hidden="true">
                <i
                  v-for="n in 3"
                  :key="n"
                  class="w-1.5 rounded-xs"
                  :class="n <= i + 1 ? 'bg-ink' : 'bg-paper-3'"
                  :style="{ height: `${[8, 14, 22][n - 1]}px` }"
                />
              </span>
              <span class="text-xl leading-[1.1] font-bold">{{ level.title }}</span>
              <span class="text-sm text-ink-2">{{ level.text }}</span>
            </label>
          </div>
        </fieldset>
      </template>

      <template v-else-if="step === 2">
        <fieldset class="m-0 min-w-0 border-0 p-0" data-rv>
          <legend class="idx kicker text-ink-2">01 / Цель</legend>
          <div class="lvls">
            <label v-for="goal in goals" :key="goal.value" class="lvl">
              <input v-model="draft.goal" type="radio" name="goal" :value="goal.value">
              <span class="lvl-tick"><Check /></span>
              <component :is="goal.icon" class="size-7.5 stroke-[1.6]" aria-hidden="true" />
              <span class="text-xl leading-[1.1] font-bold">{{ goal.title }}</span>
              <span class="text-sm text-ink-2">{{ goal.text }}</span>
            </label>
          </div>
        </fieldset>

        <div data-rv>
          <label for="ob-topic" class="idx kicker text-ink-2">02 / Тема доклада, если уже есть</label>
          <textarea
            id="ob-topic"
            v-model="draft.topic"
            class="inp"
            rows="3"
            aria-describedby="ob-topic-hint"
            placeholder="Например, как мы перевели сервис на очереди"
          />
          <p id="ob-topic-hint" class="hint mt-2.5">Необязательно. По теме точнее подберём треки мероприятий.</p>
        </div>
      </template>

      <template v-else>
        <div v-if="dict.kind === 'error'" class="alert alert-soft" role="alert">
          <CircleAlert />
          <p class="text-sm">
            Не удалось загрузить список городов и форматов. Проверьте соединение и попробуйте ещё раз.
          </p>
          <button type="button" class="b b-ink b-sm" @click="loadDictionaries">Повторить</button>
        </div>
        <template v-else>
          <div data-rv>
            <label for="ob-city" class="idx kicker text-ink-2">01 / Город</label>
            <span
              v-if="dict.kind === 'loading'"
              class="sk w-full max-w-105 rounded-xs"
              style="height: 50px"
              role="status"
            >
              <span class="sr-only">Загружаем список городов</span>
            </span>
            <div v-else class="relative max-w-105">
              <input
                id="ob-city"
                v-model="cityQuery"
                class="inp pr-11"
                type="text"
                list="ob-cities"
                aria-describedby="ob-city-hint"
                autocomplete="off"
                @blur="closeCities"
                @input="pickCity"
              >
              <datalist id="ob-cities">
                <option v-for="city in cities" :key="city.id" :value="city.name" />
              </datalist>
              <ChevronDown
                class="pointer-events-none absolute top-1/2 right-3.5 size-4.5 -translate-y-1/2 text-ink-2"
              />
            </div>
            <p id="ob-city-hint" class="hint mt-2.5">
              Начните вводить, подскажем из списка. Онлайн-мероприятия покажем при любом городе.
            </p>
          </div>

          <fieldset class="m-0 min-w-0 border-0 p-0" data-rv>
            <legend class="idx kicker text-ink-2">02 / Формат</legend>
            <div class="flex flex-wrap gap-2">
              <label v-for="format in formats" :key="format.value" class="pick">
                <input v-model="draft.formats" type="checkbox" :value="format.value">
                {{ format.title }}
              </label>
            </div>
            <p class="hint mt-2.5">Можно выбрать несколько.</p>
          </fieldset>
        </template>

        <div data-rv>
          <span class="idx kicker text-ink-2">03 / Оплата</span>
          <label class="swt">
            <span class="flex flex-col gap-1">
              <span class="text-xl leading-[1.1] font-bold">Только оплачиваемые</span>
              <span id="ob-paid-hint" class="hint">Оплату отмечаем, только если организатор её указал.</span>
            </span>
            <input
              v-model="draft.paidOnly"
              type="checkbox"
              role="switch"
              :aria-checked="draft.paidOnly"
              aria-describedby="ob-paid-hint"
            >
            <i aria-hidden="true" />
          </label>
        </div>
      </template>

      <div v-if="save.kind === 'error'" class="alert" role="alert">
        <CircleAlert />
        <p class="text-sm"><b>Не удалось сохранить ответы.</b> Выбор на месте, попробуйте ещё раз.</p>
        <button type="button" class="b b-ink b-sm" @click="next">Повторить</button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 pt-7 shadow-[inset_0_1px_0_var(--line)]" data-rv>
        <router-link v-if="step > 1" :to="`/onboarding/${step - 1}`" class="b b-line"><ArrowLeft />Назад</router-link>
        <span v-else class="text-sm text-ink-2">Всё можно поменять позже в профиле</span>
        <div class="flex items-center gap-7">
          <button v-if="step === 2" type="button" class="kicker ln" :disabled="busy" @click="skip">Пропустить</button>
          <span v-if="step === 3" class="text-sm text-ink-2">Всё можно поменять позже в профиле</span>
          <button type="submit" class="b b-mint" :disabled="!valid || busy">
            <LoaderCircle v-if="save.kind === 'saving'" class="animate-spin" />
            {{ step === 3 ? 'Показать подборку' : 'Далее' }}
            <ArrowRight v-if="save.kind !== 'saving'" />
          </button>
        </div>
      </div>
    </form>

    <template #footer>
      <footer
        class="relative mx-4 grid items-end gap-x-12 gap-y-4 pt-5 pb-7 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-line sm:mx-8 md:grid-cols-[minmax(0,1fr)_auto]"
      >
        <ol aria-label="Шаги онбординга" class="grid grid-cols-3 gap-1.5">
          <li
            v-for="(title, i) in ['Сфера и опыт', 'Цель', 'Формат']"
            :key="title"
            class="relative flex flex-col gap-1 before:absolute before:inset-x-0 before:-top-5.25 before:h-0.75 before:rounded-xs"
            :class="i < step ? 'text-ink before:bg-ink' : 'text-quiet'"
            :aria-current="i + 1 === step ? 'step' : undefined"
          >
            <span class="kicker">0{{ i + 1 }}</span>
            <b class="text-[15px] font-medium">{{ title }}</b>
          </li>
        </ol>
        <div class="kicker flex flex-wrap gap-x-6 gap-y-2 text-ink-2">
          <button type="button" class="ln kicker" :disabled="busy" @click="skip">Пропустить, заполню позже</button>
        </div>
      </footer>
    </template>
  </app-onboarding-frame>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleAlert, LoaderCircle, Mic, TrendingUp } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  type City,
  completeOnboarding,
  listCities,
  listPositionCategories,
  type PositionCategory,
  skipOnboarding,
} from '@/api/generated'
import AppOnboardingFrame from '@/components/AppOnboardingFrame.vue'
import { draft } from '@/components/speaker/onboardingDraft'
import { useAuth } from '@/composables/useAuth'

type Dictionaries =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; categories: PositionCategory[]; cities: City[] }
type Save = { kind: 'idle' } | { kind: 'saving' } | { kind: 'error' }

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const step = computed(() => Number(route.params.step))
const dict = ref<Dictionaries>({ kind: 'loading' })
const save = ref<Save>({ kind: 'idle' })
const busy = computed(() => save.value.kind === 'saving')

const steps = [
  {
    title: 'Расскажите о себе',
    lead: 'По сфере и опыту выступлений подберём мероприятия, где ваш доклад будет к месту.',
    hint: 'По сфере и опыту выступлений подберём мероприятия, где ваш доклад будет к месту.',
  },
  {
    title: 'Зачем вам TRIX',
    lead: 'От цели зависит, что окажется в подборке: конференции с отбором докладов или митапы для старта.',
    hint: 'Выступать сейчас или сначала прокачаться — от этого зависит, какие площадки мы предложим.',
  },
  {
    title: 'Где и как выступать',
    lead: 'Всё на этом шаге необязательно. Пропустите — покажем мероприятия без этих фильтров.',
    hint: 'Город и формат сузят подборку. Шаг можно пропустить.',
  },
]
const current = computed(() => steps[step.value - 1] ?? steps[0])

const levels = [
  { value: 'beginner', title: 'Начинающий', text: 'Ещё не выступал или выступал пару раз' },
  { value: 'intermediate', title: 'Есть опыт', text: 'Выступал на митапах или внутри компании' },
  { value: 'experienced', title: 'Опытный', text: 'Регулярно выступаю на конференциях' },
] as const
const goals = [
  { value: 'speak', title: 'Выступать', text: 'Найти площадки и подать доклад', icon: Mic },
  {
    value: 'grow',
    title: 'Расти',
    text: 'Сначала прокачаться: начать с митапов и внутренних площадок',
    icon: TrendingUp,
  },
] as const
const formats = [
  { value: 'offline', title: 'Офлайн' },
  { value: 'online', title: 'Онлайн' },
  { value: 'hybrid', title: 'Гибрид' },
] as const

const cityQuery = ref('')
const cities = computed(() => (dict.value.kind === 'ready' ? dict.value.cities : []))
// Пока пользователь печатает, выбранным считается только точное совпадение с названием из списка
const pickCity = () => {
  const typed = cityQuery.value.trim().toLocaleLowerCase('ru')
  draft.cityId = cities.value.find((city) => city.name.toLocaleLowerCase('ru') === typed)?.id ?? null
}
const closeCities = () => {
  if (!draft.cityId) cityQuery.value = ''
}

const valid = computed(() => {
  if (step.value === 1) return !!draft.sphereId && !!draft.experience
  if (step.value === 2) return !!draft.goal
  return true
})

const loadDictionaries = async () => {
  dict.value = { kind: 'loading' }
  const [categories, citiesRes] = await Promise.all([listPositionCategories(), listCities()])
  if (categories.status !== 200 || citiesRes.status !== 200) {
    dict.value = { kind: 'error' }
    return
  }
  dict.value = { kind: 'ready', categories: categories.data, cities: citiesRes.data }
  cityQuery.value = citiesRes.data.find((city) => city.id === draft.cityId)?.name ?? ''
}

const skip = async () => {
  save.value = { kind: 'saving' }
  const res = await skipOnboarding()
  if (res.status !== 200) {
    save.value = { kind: 'idle' }
    return toast.error(res.data.message)
  }
  user.value = res.data
  await router.replace('/events')
}

const next = async () => {
  if (!valid.value || busy.value) return
  if (step.value < 3) return router.push(`/onboarding/${step.value + 1}`)
  if (!draft.sphereId || !draft.experience || !draft.goal) return router.replace('/onboarding/1')

  save.value = { kind: 'saving' }
  const res = await completeOnboarding({
    position_category_ids: [draft.sphereId],
    speaking_experience: draft.experience,
    goal: draft.goal,
    preferred_city_id: draft.cityId,
    preferred_formats: draft.formats,
    paid_only: draft.paidOnly,
  })
  if (res.status !== 200) {
    save.value = { kind: 'error' }
    return
  }
  user.value = res.data
  await router.replace('/events')
}

onMounted(() => {
  // Шаги 2 и 3 без ответов предыдущих открыть нельзя: возвращаем на первый незаполненный.
  if (step.value > 1 && !(draft.sphereId && draft.experience)) void router.replace('/onboarding/1')
  else if (step.value > 2 && !draft.goal) void router.replace('/onboarding/2')
  void loadDictionaries()
})
</script>
