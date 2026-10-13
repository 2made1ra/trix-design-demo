<template>
  <org-split>
    <template #card>
      <span class="kicker text-ink-2">Приглашение в организацию</span>
      <p class="text-2xl leading-[1.05] font-bold">Вас пригласили в {{ info?.organization_name ?? 'организацию' }}</p>
      <dl class="text-sm">
        <div
          v-for="[ term, value ] in facts"
          :key="term"
          class="flex flex-col gap-1 py-3 shadow-[inset_0_1px_0_var(--line-2)]"
        >
          <dt class="kicker text-ink-2">{{ term }}</dt>
          <dd class="text-[17px] font-semibold">{{ value }}</dd>
        </div>
      </dl>
      <p class="text-sm text-ink-2">
        Заявку организации подтвердила команда TRIX. Вы первым настроите организацию: направления, города, команду и
        спикеров.
      </p>
    </template>
    <template #big>TRIX<span class="font-light text-ink/30">.</span></template>

    <p v-if="state.kind === 'loading'" class="text-ink-2" role="status">Загружаем приглашение…</p>

    <section
      v-else-if="state.kind === 'expired'"
      class="flex max-w-140 flex-col gap-8"
      aria-labelledby="title"
      aria-live="polite"
    >
      <div class="flex flex-col gap-6" data-rv>
        <span
          class="flex size-16 items-center justify-center rounded-full bg-paper-2 shadow-[inset_0_0_0_1px_var(--field)]"
          aria-hidden="true"
        >
          <ClockIcon class="size-7" />
        </span>
        <h1 id="title" class="shout text-d1">Приглашение устарело</h1>
        <p class="text-xl leading-[1.55] text-ink-2">
          Ссылка из письма больше не действует: срок вышел или приглашение уже использовано. Запросите новое, и если для
          этой почты есть приглашение, мы пришлём его письмом.
        </p>
      </div>
      <div class="flex flex-wrap gap-3" data-rv>
        <org-button :to="{ name: 'connect' }">Запросить новое</org-button>
        <org-button variant="line" :to="{ name: 'companies.landing' }">На главную</org-button>
      </div>
    </section>

    <section v-else class="flex max-w-140 flex-col gap-8" aria-labelledby="title">
      <p v-if="state.kind === 'new'" class="self-end text-sm text-ink-2" data-rv>
        Уже есть аккаунт?
        <button
          type="button"
          class="ml-1.5 font-semibold text-ink shadow-[inset_0_-1px_0_currentColor]"
          @click="goLogin"
        >
          Войти
        </button>
      </p>

      <div class="flex flex-col gap-4" data-rv>
        <span class="tag fill-lime self-start">Компаниям</span>
        <h1 id="title" class="shout text-d1">{{ texts[state.kind].title }}</h1>
        <p class="text-xl leading-[1.55] text-ink-2">
          {{ texts[state.kind].lead }}
          <b v-if="state.kind === 'current'" class="font-mono text-[15px] break-all text-ink">{{
            state.info.current_email
          }}</b>
          <template v-if="state.kind === 'current'">
            Принять приглашение в этот аккаунт? Рабочая почта добавится к нему.</template
          >
        </p>
      </div>

      <div v-if="state.kind === 'current'" class="tile tile-slate flex flex-col gap-1.5 px-6 py-5" data-rv>
        <span class="kicker text-ink-2">Что произойдёт</span>
        <p class="text-sm">
          Рабочая почта {{ state.info.email }} появится в вашем аккаунте, а организация
          {{ state.info.organization_name }} откроется переключателем «Организация | Личное». Второго аккаунта не будет.
        </p>
      </div>

      <form class="flex flex-col gap-7" novalidate data-rv @submit.prevent="submit">
        <fieldset v-if="state.kind !== 'current'" class="flex min-w-0 flex-col gap-6">
          <div class="flex flex-col gap-2">
            <span class="kicker text-ink-2">Рабочая почта</span>
            <div
              class="flex flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-xs bg-paper-2 px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--line-2)]"
            >
              <b class="text-[17px] font-semibold [overflow-wrap:anywhere]">{{ state.info.email }}</b>
              <span class="tag fill-mint">Подтверждена</span>
            </div>
          </div>
          <div v-if="state.kind === 'new'" class="flex flex-col gap-2.5">
            <label for="name" class="org-label">Имя</label>
            <input
              id="name"
              v-model="form.name"
              class="org-inp"
              type="text"
              autocomplete="name"
              placeholder="Имя и фамилия"
              :aria-invalid="!!errors.name"
            >
            <p v-if="errors.name" class="org-err" role="alert">{{ errors.name }}</p>
          </div>
          <div class="flex flex-col gap-2.5">
            <label for="password" class="org-label">Пароль</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                class="org-inp pr-13"
                :type="showPassword ? 'text' : 'password'"
                :autocomplete="state.kind === 'new' ? 'new-password' : 'current-password'"
                :aria-invalid="!!errors.password"
                aria-describedby="password-hint"
              >
              <button
                type="button"
                class="absolute top-0.75 right-0.75 flex size-11 items-center justify-center rounded-xs text-ink-2 hover:text-ink"
                :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? EyeOffIcon : EyeIcon" class="size-4.5" />
              </button>
            </div>
            <p v-if="errors.password" class="org-err" role="alert">{{ errors.password }}</p>
            <p v-else-if="state.kind === 'new'" id="password-hint" class="text-[13px] leading-normal text-ink-2">
              Не короче 8 символов
            </p>
          </div>
        </fieldset>

        <div class="flex flex-wrap gap-3">
          <org-button type="submit" :block="state.kind !== 'current'" :disabled="sending">
            {{ texts[state.kind].action }}<ArrowRightIcon />
          </org-button>
          <org-button v-if="state.kind === 'current'" variant="line" @click="goLogin">Войти под другим</org-button>
        </div>
      </form>

      <p v-if="state.kind === 'new'" class="text-sm text-ink-2" data-rv>
        Принимая приглашение, вы соглашаетесь с политикой конфиденциальности.
      </p>
    </section>
  </org-split>
</template>

<script setup lang="ts">
import { ArrowRightIcon, ClockIcon, EyeIcon, EyeOffIcon } from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { type AcceptInviteInput, acceptInvite, getInvite, type InviteInfo } from '@/api/demo'
import OrgButton from '@/components/org/OrgButton.vue'
import OrgSplit from '@/components/org/OrgSplit.vue'
import { useAuth } from '@/composables/useAuth'

type State = { kind: 'loading' } | { kind: 'expired' } | { kind: 'new' | 'exists' | 'current'; info: InviteInfo }

const route = useRoute()
const router = useRouter()
const { setToken, logout } = useAuth()
const token = String(route.params.token)
const state = ref<State>({ kind: 'loading' })
const sending = ref(false)
const showPassword = ref(false)
const form = reactive({ name: '', password: '' })
const errors = reactive({ name: '', password: '' })

const texts = {
  loading: { title: '', lead: '', action: '' },
  expired: { title: '', lead: '', action: '' },
  new: {
    title: 'Принять приглашение',
    lead: 'Почта подтверждена ссылкой из письма. Осталось назвать себя и придумать пароль.',
    action: 'Принять приглашение',
  },
  exists: {
    title: 'Войдите, чтобы принять',
    lead: 'Аккаунт с этой почтой уже есть. Войдите, и приглашение добавится к нему.',
    action: 'Войти и принять',
  },
  current: { title: 'Принять в этот аккаунт?', lead: 'Вы вошли как', action: 'Принять в этот аккаунт' },
}

const info = computed(() =>
  state.value.kind === 'loading' || state.value.kind === 'expired' ? null : state.value.info,
)
const facts = [
  ['Роль', 'Команда, администратор'],
  ['От кого', 'TRIX'],
]

onMounted(async () => {
  const res = await getInvite(token)
  if (res.status !== 200) {
    state.value = { kind: 'expired' }
    return
  }
  const { current_email: current, account_exists: exists } = res.data
  state.value = { kind: current ? 'current' : exists ? 'exists' : 'new', info: res.data }
})

const goLogin = () => {
  logout()
  router.push({ name: 'login' })
}

const body = (): AcceptInviteInput | null => {
  errors.name = ''
  errors.password = ''
  const kind = state.value.kind
  if (kind === 'current') return { mode: 'current' }
  if (kind === 'new') {
    if (!form.name.trim()) errors.name = 'Назовите себя'
    if (form.password.length < 8) errors.password = 'Пароль не короче 8 символов'
    return errors.name || errors.password ? null : { mode: 'register', first_name: form.name, password: form.password }
  }
  if (!form.password) errors.password = 'Введите пароль'
  return errors.password ? null : { mode: 'login', password: form.password }
}

const submit = async () => {
  const input = body()
  if (!input) return
  sending.value = true
  const res = await acceptInvite(token, input)
  sending.value = false
  if (res.status !== 200) {
    if (res.data.key === 'invalid_credentials') errors.password = res.data.message
    else toast.error(res.data.message)
    return
  }
  await setToken(res.data.token, res.data.user)
  router.push('/org/onboarding/1')
}
</script>
