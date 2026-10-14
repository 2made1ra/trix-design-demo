<template>
  <app-onboarding-frame side="co" :home="{ name: 'companies.landing' }" big="TRIX" sub="." :footer="false">
    <template #float>
      <span class="k muted">Приглашение в организацию</span>
      <p class="h-24">Вас пригласили в {{ info?.organization_name ?? 'организацию' }}</p>
      <dl class="facts small">
        <div v-for="[ term, value ] in facts" :key="term">
          <dt class="k muted">{{ term }}</dt>
          <dd>{{ value }}</dd>
        </div>
      </dl>
      <p class="small muted">
        Заявку организации подтвердила команда TRIX. Вы первым настроите организацию: направления, города, команду и
        спикеров.
      </p>
    </template>

    <p v-if="state.kind === 'loading'" class="muted" role="status">Загружаем приглашение…</p>

    <section v-else-if="state.kind === 'expired'" class="pnl gap-8" aria-labelledby="title" aria-live="polite">
      <div class="flex flex-col gap-6" data-rv>
        <span class="stop" aria-hidden="true"><ClockIcon /></span>
        <h1 id="title" class="d-1">Приглашение устарело</h1>
        <p class="deck text-[20px]">
          Ссылка из письма больше не действует: срок вышел или приглашение уже использовано. Запросите новое, и если для
          этой почты есть приглашение, мы пришлём его письмом.
        </p>
      </div>
      <div class="acts" data-rv>
        <router-link :to="{ name: 'connect' }" class="b b-mint">Запросить новое</router-link>
        <router-link :to="{ name: 'companies.landing' }" class="b b-line">На главную</router-link>
      </div>
    </section>

    <div v-else class="flex flex-col gap-10">
      <p v-if="state.kind === 'new'" class="small muted top" data-rv>
        Уже есть аккаунт?
        <button type="button" class="ln ml-1.5 font-semibold text-ink" @click="goLogin">Войти</button>
      </p>

      <section class="pnl gap-8" aria-labelledby="title">
        <div class="flex flex-col gap-4" data-rv>
          <span class="tag lime self-start">Компаниям</span>
          <h1 id="title" class="d-1">{{ texts[state.kind].title }}</h1>
          <p class="deck text-[20px]">
            {{ texts[state.kind].lead }}
            <template v-if="state.kind === 'current'">
              <span class="who">{{ state.info.current_email }}</span>
              Принять приглашение в этот аккаунт? Рабочая почта добавится к нему.
            </template>
          </p>
        </div>

        <app-tile v-if="state.kind === 'current'" tone="slate" class="note" data-rv>
          <span class="k muted">Что произойдёт</span>
          <p class="small">
            Рабочая почта {{ state.info.email }} появится в вашем аккаунте, а организация
            {{ state.info.organization_name }} откроется переключателем «Организация | Личное». Второго аккаунта не
            будет.
          </p>
        </app-tile>

        <form class="flex flex-col gap-7" novalidate data-rv @submit.prevent="submit">
          <fieldset v-if="state.kind !== 'current'" class="fs">
            <div class="mail">
              <span class="k muted">Рабочая почта</span>
              <div class="mail-row">
                <b>{{ state.info.email }}</b>
                <span class="tag mint">Подтверждена</span>
              </div>
            </div>
            <app-field
              v-if="state.kind === 'new'"
              id="name"
              v-model="form.name"
              label="Имя"
              autocomplete="name"
              placeholder="Имя и фамилия"
              :error="errors.name"
            />
            <app-field
              id="password"
              v-model="form.password"
              label="Пароль"
              type="password"
              :autocomplete="state.kind === 'new' ? 'new-password' : 'current-password'"
              :error="errors.password"
              :hint="state.kind === 'new' ? 'Не короче 8 символов' : undefined"
            />
          </fieldset>

          <div v-if="state.kind === 'current'" class="acts">
            <button type="submit" class="b b-mint" :disabled="sending">
              {{ texts[state.kind].action }}<ArrowRightIcon />
            </button>
            <button type="button" class="b b-line" @click="goLogin">Войти под другим</button>
          </div>
          <button v-else type="submit" class="b b-mint go" :disabled="sending">
            {{ texts[state.kind].action }}<ArrowRightIcon />
          </button>
        </form>

        <p v-if="state.kind === 'new'" class="small muted" data-rv>
          Принимая приглашение, вы соглашаетесь с <a href="#privacy-policy" class="ln">политикой конфиденциальности</a>.
        </p>
        <p v-else-if="state.kind === 'exists'" class="small" data-rv><a href="#reset" class="ln">Забыли пароль?</a></p>
      </section>
    </div>

    <template #footer>
      <footer class="rf k muted">
        <span>© 2026 TRIX</span>
        <div>
          <a href="#help" class="ln">Помощь</a><a href="#privacy-policy" class="ln">Политика конфиденциальности</a>
        </div>
      </footer>
    </template>
  </app-onboarding-frame>
</template>

<script setup lang="ts">
import { ArrowRightIcon, ClockIcon } from '@lucide/vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { type AcceptInviteInput, acceptInvite, getInvite, type InviteInfo } from '@/api/demo'
import AppField from '@/components/AppField.vue'
import AppOnboardingFrame from '@/components/AppOnboardingFrame.vue'
import AppTile from '@/components/AppTile.vue'
import { useAuth } from '@/composables/useAuth'

type State = { kind: 'loading' } | { kind: 'expired' } | { kind: 'new' | 'exists' | 'current'; info: InviteInfo }

const route = useRoute()
const router = useRouter()
const { setToken, logout } = useAuth()
const token = computed(() => String(route.params.token))
const state = ref<State>({ kind: 'loading' })
const sending = ref(false)
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

const load = async () => {
  state.value = { kind: 'loading' }
  const res = await getInvite(token.value)
  if (res.status !== 200) {
    state.value = { kind: 'expired' }
    return
  }
  const { current_email: current, account_exists: exists } = res.data
  state.value = { kind: current ? 'current' : exists ? 'exists' : 'new', info: res.data }
}

onMounted(load)
watch(token, load)

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
  const res = await acceptInvite(token.value, input)
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
