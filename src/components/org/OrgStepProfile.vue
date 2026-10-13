<template>
  <p v-if="state.kind === 'loading'" class="text-ink-2" role="status">Загружаем справочники…</p>
  <div v-else-if="state.kind === 'error'" class="flex flex-col items-start gap-4" role="alert">
    <p>Не удалось загрузить справочники.</p>
    <org-button variant="line" @click="load">Попробовать снова</org-button>
  </div>

  <form v-else class="flex flex-col gap-12" novalidate @submit.prevent="submit">
    <fieldset class="min-w-0" data-rv>
      <legend :class="legendClass">01 / Название</legend>
      <div class="flex max-w-115 flex-col gap-2.5">
        <label for="org-name" class="org-label">Название организации</label>
        <input
          id="org-name"
          v-model="form.name"
          class="org-inp"
          type="text"
          autocomplete="organization"
          :aria-invalid="!!errors.name"
        >
        <p v-if="errors.name" class="org-err" role="alert">{{ errors.name }}</p>
        <p v-else class="text-[13px] leading-normal text-ink-2">Подставлено из заявки.</p>
      </div>
    </fieldset>

    <fieldset class="min-w-0" data-rv>
      <legend :class="legendClass">02 / Направления</legend>
      <p class="mb-4 text-[13px] leading-normal text-ink-2">
        Выберите всё, чем занимаются ваши спикеры. Можно несколько.
      </p>
      <div class="flex flex-wrap gap-2">
        <label v-for="direction in state.directions" :key="direction.id" class="pick">
          <input v-model="form.directionIds" type="checkbox" :value="direction.id">
          {{ direction.name }}
        </label>
      </div>
      <p v-if="errors.directions" class="org-err mt-3" role="alert">{{ errors.directions }}</p>
    </fieldset>

    <fieldset class="min-w-0" data-rv>
      <legend :class="legendClass">03 / Города присутствия</legend>
      <ul v-if="form.cityIds.length" class="mb-4 flex flex-wrap gap-2" aria-label="Выбранные города">
        <li
          v-for="id in form.cityIds"
          :key="id"
          class="inline-flex h-9.5 items-center gap-1 rounded-3xl bg-paper-2 pr-1.5 pl-4 text-sm font-semibold shadow-[inset_0_0_0_1px_var(--field)]"
        >
          <span>{{ cityName(id) }}</span>
          <button
            type="button"
            class="flex size-6.5 items-center justify-center rounded-full text-ink-2 hover:bg-paper-3 hover:text-ink"
            :aria-label="`Убрать: ${cityName(id)}`"
            @click="removeCity(id)"
          >
            <XIcon class="size-3" />
          </button>
        </li>
      </ul>
      <div class="flex max-w-115 flex-wrap gap-2">
        <label class="sr-only" for="city-add">Город</label>
        <input
          id="city-add"
          v-model="cityQuery"
          class="org-inp w-auto min-w-0 flex-[1_1_200px]"
          type="text"
          list="city-list"
          placeholder="Город"
          :aria-invalid="!!errors.cities"
          @keydown.enter.prevent="addCity"
        >
        <datalist id="city-list">
          <option v-for="city in state.cities" :key="city.id" :value="city.name" />
        </datalist>
        <org-button variant="line" @click="addCity">Добавить город</org-button>
      </div>
      <p v-if="errors.cities" class="org-err mt-3" role="alert">{{ errors.cities }}</p>
    </fieldset>

    <fieldset class="min-w-0" data-rv>
      <legend :class="legendClass">04 / Домены почты</legend>
      <ul v-if="form.domains.length" class="mb-4 flex flex-wrap gap-2" aria-label="Домены организации">
        <li
          v-for="domain in form.domains"
          :key="domain"
          class="inline-flex h-9.5 items-center gap-1 rounded-3xl bg-paper-2 pr-1.5 pl-4 font-mono text-sm font-semibold shadow-[inset_0_0_0_1px_var(--field)]"
        >
          <span>{{ domain }}</span>
          <button
            type="button"
            class="flex size-6.5 items-center justify-center rounded-full text-ink-2 hover:bg-paper-3 hover:text-ink"
            :aria-label="`Убрать: ${domain}`"
            @click="removeDomain(domain)"
          >
            <XIcon class="size-3" />
          </button>
        </li>
      </ul>
      <div class="flex max-w-115 flex-wrap gap-2">
        <label class="sr-only" for="domain-add">Домен</label>
        <input
          id="domain-add"
          v-model="domainQuery"
          class="org-inp w-auto min-w-0 flex-[1_1_200px]"
          type="text"
          placeholder="company.ru"
          autocapitalize="off"
          :aria-invalid="!!errors.domain"
          @keydown.enter.prevent="addDomain"
        >
        <org-button variant="line" @click="addDomain">Добавить домен</org-button>
      </div>
      <p v-if="errors.domain" class="org-err mt-3" role="alert">{{ errors.domain }}</p>
      <p v-else class="mt-3 text-[13px] leading-normal text-ink-2">
        По домену коллеги и спикеры попадают в организацию только по приглашению
      </p>
    </fieldset>

    <div class="flex flex-wrap items-center justify-between gap-4 pt-7 shadow-[inset_0_1px_0_var(--line)]" data-rv>
      <span class="text-sm text-ink-2">Онбординг можно прервать — продолжите с этого шага</span>
      <org-button type="submit" :disabled="saving">Далее<ArrowRightIcon /></org-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ArrowRightIcon, XIcon } from '@lucide/vue'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { saveOrganizationProfile } from '@/api/demo'
import { type City, listCities, listPositionCategories, type PositionCategory } from '@/api/generated'
import { legendClass } from '@/components/org/classes'
import OrgButton from '@/components/org/OrgButton.vue'
import { useAuth } from '@/composables/useAuth'

type State = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; directions: PositionCategory[]; cities: City[] }

const router = useRouter()
const { user, org, loadOrg } = useAuth()
const state = ref<State>({ kind: 'loading' })
const saving = ref(false)
const cityQuery = ref('')
const domainQuery = ref('')
const form = reactive({
  name: org.value?.name ?? '',
  directionIds: [...(org.value?.direction_ids ?? [])],
  cityIds: [...(org.value?.city_ids ?? [])],
  // Первым предлагаем домен почты администратора.
  domains: org.value?.domains?.length
    ? [...org.value.domains]
    : [user.value?.email.split('@')[1] ?? ''].filter(Boolean),
})
const errors = reactive({ name: '', directions: '', cities: '', domain: '' })

const load = async () => {
  state.value = { kind: 'loading' }
  const [directions, cities] = await Promise.all([listPositionCategories(), listCities()])
  state.value =
    directions.status === 200 && cities.status === 200
      ? { kind: 'ready', directions: directions.data, cities: cities.data }
      : { kind: 'error' }
}

onMounted(load)

const cityName = (id: string) => (state.value.kind === 'ready' ? state.value.cities.find((c) => c.id === id)?.name : '')

const addCity = () => {
  if (state.value.kind !== 'ready' || !cityQuery.value.trim()) return
  const query = cityQuery.value.trim().toLowerCase()
  const city = state.value.cities.find((c) => c.name.toLowerCase() === query)
  if (!city) {
    errors.cities = 'Выберите город из списка'
    return
  }
  errors.cities = ''
  if (!form.cityIds.includes(city.id)) form.cityIds.push(city.id)
  cityQuery.value = ''
}

const removeCity = (id: string) => {
  form.cityIds = form.cityIds.filter((cityId) => cityId !== id)
}

const addDomain = () => {
  const domain = domainQuery.value.trim().toLowerCase()
  if (!domain) return
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) {
    errors.domain = 'Домен вида company.ru'
    return
  }
  errors.domain = ''
  if (!form.domains.includes(domain)) form.domains.push(domain)
  domainQuery.value = ''
}

const removeDomain = (domain: string) => {
  form.domains = form.domains.filter((d) => d !== domain)
}

const submit = async () => {
  errors.name = form.name.trim() ? '' : 'Укажите название организации'
  errors.directions = form.directionIds.length ? '' : 'Выберите хотя бы одно направление'
  errors.cities = form.cityIds.length ? '' : 'Добавьте хотя бы один город'
  if (errors.name || errors.directions || errors.cities) return

  saving.value = true
  const res = await saveOrganizationProfile({
    name: form.name,
    site: org.value?.site ?? undefined,
    direction_ids: form.directionIds,
    city_ids: form.cityIds,
    domains: form.domains,
  })
  if (res.status !== 200) {
    saving.value = false
    return void toast.error(res.data.message)
  }
  await loadOrg()
  router.push('/org/onboarding/2')
}
</script>
