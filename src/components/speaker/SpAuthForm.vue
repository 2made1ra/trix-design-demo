<template>
  <app-onboarding-frame big="TRIX" sub="." wide>
    <template #float>
      <span class="k muted">Закрытая бета</span>
      <p class="h-24">За пару минут — подборка мероприятий и разбор доклада</p>
      <ul class="ticks small">
        <li>Мероприятия под вашу сферу и опыт, с объяснением, почему подходят</li>
        <li>Разбор доклада под аудиторию выбранного мероприятия</li>
        <li>Разбор видите только вы</li>
      </ul>
      <div class="flex flex-col gap-2">
        <span class="k muted">После регистрации</span>
        <ol class="path small" aria-label="Шаги после регистрации">
          <li v-for="item in ['Сфера и опыт', 'Цель', 'Формат', 'Подборка']" :key="item">{{ item }}</li>
        </ol>
      </div>
    </template>

    <div class="sw self-start" role="tablist" aria-label="Регистрация или вход" data-rv>
      <app-pick replace to="/register" role="tab" :aria-selected="!login">Регистрация</app-pick>
      <app-pick replace to="/login" role="tab" :aria-selected="login">Вход</app-pick>
    </div>

    <section class="pnl" role="tabpanel">
      <div class="flex flex-col gap-4" data-rv>
        <h1 class="d-1">{{ login ? 'С возвращением' : 'Создайте аккаунт' }}</h1>
        <p class="deck text-xl">
          {{
            login
              ? 'Подборка и разборы ждут в профиле.'
              : 'Дальше три коротких вопроса о вас, и откроется подборка мероприятий.'
          }}
        </p>
      </div>

      <form class="flex flex-col gap-7" novalidate data-rv @submit.prevent="submit">
        <fieldset class="fs" :disabled="sending">
          <app-field
            v-if="!login"
            id="auth-name"
            v-model="form.name"
            label="Имя"
            autocomplete="name"
            placeholder="Как к вам обращаться"
            :error="errors.name"
            @input="errors.name = ''"
          />

          <app-field
            id="auth-email"
            v-model="form.email"
            label="Почта"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            :error="errors.email"
            @input="errors.email = ''"
          >
            <template #error>
              <span>
                {{ errors.email }}
                <router-link v-if="emailTaken" replace to="/login" class="ln font-semibold">Войти</router-link>
              </span>
            </template>
          </app-field>

          <app-field
            id="auth-pass"
            v-model="form.password"
            label="Пароль"
            type="password"
            :autocomplete="login ? 'current-password' : 'new-password'"
            :error="errors.password"
            :hint="login ? undefined : 'Не короче 8 символов'"
            @input="errors.password = ''"
          >
            <template v-if="login" #aside><a href="#reset" class="small ln">Забыли пароль?</a></template>
          </app-field>
        </fieldset>

        <p v-if="errors.form" class="err" role="alert"><CircleAlert />{{ errors.form }}</p>

        <app-button type="submit" variant="mint" class="w-full" :disabled="sending" :aria-busy="sending">
          <template v-if="sending">
            <span class="spin" aria-hidden="true" />{{ login ? 'Входим' : 'Создаём аккаунт' }}
          </template>
          <template v-else>{{ login ? 'Войти' : 'Создать аккаунт' }}<ArrowRight /></template>
        </app-button>
        <p class="sr-only" role="status">{{ sending ? (login ? 'Входим' : 'Создаём аккаунт') : '' }}</p>
        <p v-if="!login" class="small muted">
          Нажимая «Создать аккаунт», вы соглашаетесь с <a href="#terms" class="ln">условиями использования</a> и
          <a href="#privacy-policy" class="ln">политикой конфиденциальности</a>.
        </p>
      </form>

      <p class="small muted" data-rv>
        {{ login ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
        <router-link replace :to="login ? '/register' : '/login'" class="lnb ln font-semibold text-ink hover:text-link">
          {{ login ? 'Зарегистрироваться' : 'Войти' }}
        </router-link>
      </p>
    </section>
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
import { ArrowRight, CircleAlert } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { type Error as ApiError, type AuthResult, register, login as signIn } from '@/api/generated'
import AppButton from '@/components/AppButton.vue'
import AppField from '@/components/AppField.vue'
import AppOnboardingFrame from '@/components/AppOnboardingFrame.vue'
import AppPick from '@/components/AppPick.vue'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{ mode: 'register' | 'login' }>()

const router = useRouter()
const { setToken, startPath } = useAuth()
const login = computed(() => props.mode === 'login')
// Почта из подвала лендинга подставляется в регистрацию.
const form = reactive({ name: '', email: String(useRoute().query.email ?? ''), password: '' })
const errors = reactive({ name: '', email: '', password: '', form: '' })
const emailTaken = ref(false)
const sending = ref(false)

const MIN_PASSWORD = 8

const validate = () => {
  errors.name = login.value || form.name.trim() ? '' : 'Введите имя'
  errors.email = /^\S+@\S+\.\S+$/.test(form.email.trim()) ? '' : 'Введите почту в формате you@example.com'
  errors.password = form.password.length >= MIN_PASSWORD ? '' : `Пароль короче ${MIN_PASSWORD} символов`
  return !errors.name && !errors.email && !errors.password
}

// Имя пользователя API требует от 3 символов, в форме его нет: берём из почты.
const usernameFrom = (email: string) => (email.split('@')[0] ?? '').padEnd(3, '_')

const submit = async () => {
  errors.form = ''
  emailTaken.value = false
  if (!validate()) return

  sending.value = true
  const email = form.email.trim()
  const res = login.value
    ? await signIn({ email, password: form.password })
    : await register({
        email,
        password: form.password,
        username: usernameFrom(email),
        first_name: form.name.trim(),
        last_name: '',
        role: 'speaker',
      })
  sending.value = false

  // Успех у входа 200, у регистрации 201: «default» ошибки могут нести любой другой код, в том числе второй.
  if (login.value ? res.status !== 200 : res.status !== 201) {
    const error = res.data as ApiError
    if (error.key === 'email_taken') {
      emailTaken.value = true
      errors.email = 'Эта почта уже зарегистрирована.'
    } else if (error.key === 'invalid_credentials') errors.form = error.message
    else toast.error(error.message)
    return
  }
  const { token, user } = res.data as AuthResult
  await setToken(token, user)
  await router.replace(login.value ? startPath.value : '/onboarding/1')
}
</script>
