<template>
  <p v-if="state.kind === 'loading'" class="muted" role="status">Загружаем справочники…</p>
  <div v-else-if="state.kind === 'error'" class="flex flex-col items-start gap-4" role="alert">
    <p>Не удалось загрузить справочники.</p>
    <app-button variant="line" @click="load">Попробовать снова</app-button>
  </div>

  <form v-else class="flex flex-col gap-12" novalidate @submit.prevent="submit">
    <fieldset class="fld" data-rv>
      <legend class="idx k muted">01 / Название</legend>
      <app-field
        id="org-name"
        v-model="form.name"
        class="max-w-115"
        label="Название организации"
        autocomplete="organization"
        :error="errors.name"
        hint="Подставлено из заявки."
      />
    </fieldset>

    <fieldset class="fld" data-rv>
      <legend class="idx k muted">02 / Направления</legend>
      <p class="hint mb-4">Выберите всё, чем занимаются ваши спикеры. Можно несколько.</p>
      <app-picks>
        <app-pick
          v-for="direction in state.directions"
          :key="direction.id"
          v-model="form.directionIds"
          type="checkbox"
          :value="direction.id"
        >
          {{ direction.name }}
        </app-pick>
      </app-picks>
      <p v-if="errors.directions" class="err mt-3" role="alert"><CircleAlertIcon />{{ errors.directions }}</p>
    </fieldset>

    <fieldset class="fld" data-rv>
      <legend class="idx k muted">03 / Города присутствия</legend>
      <ul v-if="form.cityIds.length" class="chips" aria-label="Выбранные города">
        <li v-for="id in form.cityIds" :key="id" class="chip">
          <span>{{ cityName(id) }}</span>
          <button type="button" :aria-label="`Убрать: ${cityName(id)}`" @click="removeCity(id)">
            <XIcon aria-hidden="true" />
          </button>
        </li>
      </ul>
      <div class="addrow">
        <label class="sr" for="city-add">Город</label>
        <input
          id="city-add"
          v-model="cityQuery"
          class="inp"
          type="text"
          list="city-list"
          placeholder="Город"
          :aria-invalid="!!errors.cities"
          @keydown.enter.prevent="addCity"
        >
        <datalist id="city-list">
          <option v-for="city in state.cities" :key="city.id" :value="city.name" />
        </datalist>
        <app-button variant="line" @click="addCity">Добавить город</app-button>
      </div>
      <p v-if="errors.cities" class="err mt-3" role="alert"><CircleAlertIcon />{{ errors.cities }}</p>
    </fieldset>

    <fieldset class="fld" data-rv>
      <legend class="idx k muted">04 / Домены почты</legend>
      <ul v-if="form.domains.length" class="chips" aria-label="Домены организации">
        <li v-for="domain in form.domains" :key="domain" class="chip mono">
          <span>{{ domain }}</span>
          <button type="button" :aria-label="`Убрать: ${domain}`" @click="removeDomain(domain)">
            <XIcon aria-hidden="true" />
          </button>
        </li>
      </ul>
      <div class="addrow">
        <label class="sr" for="domain-add">Домен</label>
        <input
          id="domain-add"
          v-model="domainQuery"
          class="inp"
          type="text"
          placeholder="example.ru"
          inputmode="url"
          autocapitalize="off"
          :aria-invalid="!!errors.domain"
          @keydown.enter.prevent="addDomain"
        >
        <app-button variant="line" @click="addDomain">Добавить домен</app-button>
      </div>
      <p v-if="errors.domain" class="err mt-3" role="alert"><CircleAlertIcon />{{ errors.domain }}</p>
      <p v-else class="hint mt-3 max-w-130">
        По домену коллеги и спикеры попадают в организацию только по приглашению. Сами они не добавляются.
      </p>
    </fieldset>

    <div class="next" data-rv>
      <span class="small muted">Онбординг можно прервать — продолжите с этого шага</span>
      <app-button type="submit" variant="mint" :disabled="saving">Далее<ArrowRightIcon /></app-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ArrowRightIcon, CircleAlertIcon, XIcon } from '@lucide/vue'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { saveOrganizationProfile } from '@/api/demo'
import { type City, listCities, listPositionCategories, type PositionCategory } from '@/api/generated'
import AppButton from '@/components/AppButton.vue'
import AppField from '@/components/AppField.vue'
import AppPick from '@/components/AppPick.vue'
import AppPicks from '@/components/AppPicks.vue'
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
