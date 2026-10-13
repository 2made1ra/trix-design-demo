<template>
  <app-onboarding-frame big="TRIX" sub=".">
    <template #float>
      <span class="kicker text-ink-2">Закрытая бета</span>
      <p class="text-2xl leading-[1.05] font-bold">За пару минут — подборка мероприятий и разбор доклада</p>
      <ul class="ticks text-sm">
        <li>Мероприятия под вашу сферу и опыт, с объяснением, почему подходят</li>
        <li>Разбор доклада под аудиторию выбранного мероприятия</li>
        <li>Разбор видите только вы</li>
      </ul>
      <div class="flex flex-col gap-2">
        <span class="kicker text-ink-2">После регистрации</span>
        <ol
          class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm text-ink-2"
          aria-label="Шаги после регистрации"
        >
          <li
            v-for="(item, i) in ['Сфера и опыт', 'Цель', 'Формат', 'Подборка']"
            :key="item"
            class="flex items-center gap-2.5"
          >
            <span v-if="i" class="text-quiet" aria-hidden="true">→</span>{{ item }}
          </li>
        </ol>
      </div>
    </template>

    <div class="sw self-start" role="tablist" aria-label="Регистрация или вход" data-rv>
      <router-link replace to="/register" role="tab" class="pick" :aria-selected="!login">Регистрация</router-link>
      <router-link replace to="/login" role="tab" class="pick" :aria-selected="login">Вход</router-link>
    </div>

    <section class="flex max-w-140 flex-col gap-10" role="tabpanel">
      <div class="flex flex-col gap-4" data-rv>
        <h1 class="shout text-d1">{{ login ? 'С возвращением' : 'Создайте аккаунт' }}</h1>
        <p class="text-xl leading-[1.55] text-ink-2">
          {{
            login
              ? 'Подборка и разборы ждут в профиле.'
              : 'Дальше три коротких вопроса о вас, и откроется подборка мероприятий.'
          }}
        </p>
      </div>

      <form class="flex flex-col gap-7" novalidate data-rv @submit.prevent="submit">
        <fieldset class="m-0 flex min-w-0 flex-col gap-6 border-0 p-0" :disabled="sending">
          <div v-if="!login" class="field">
            <label for="auth-name">Имя</label>
            <input
              id="auth-name"
              v-model="form.name"
              class="inp"
              type="text"
              autocomplete="name"
              placeholder="Как к вам обращаться"
              :aria-invalid="!!errors.name"
              :aria-describedby="errors.name ? 'auth-name-err' : undefined"
              @input="errors.name = ''"
            >
            <p v-if="errors.name" id="auth-name-err" class="err"><CircleAlert />{{ errors.name }}</p>
          </div>

          <div class="field">
            <label for="auth-email">Почта</label>
            <input
              id="auth-email"
              v-model="form.email"
              class="inp"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              :aria-invalid="!!errors.email"
              :aria-describedby="errors.email ? 'auth-email-err' : undefined"
              @input="errors.email = ''"
            >
            <p v-if="errors.email" id="auth-email-err" class="err">
              <CircleAlert />
              <span>
                {{ errors.email }}
                <router-link v-if="emailTaken" replace to="/login" class="ln font-semibold">Войти</router-link>
              </span>
            </p>
          </div>

          <div class="field">
            <label for="auth-pass">Пароль</label>
            <div class="relative">
              <input
                id="auth-pass"
                v-model="form.password"
                class="inp pr-13"
                :type="reveal ? 'text' : 'password'"
                :autocomplete="login ? 'current-password' : 'new-password'"
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'auth-pass-err' : 'auth-pass-hint'"
                @input="errors.password = ''"
              >
              <button
                type="button"
                class="absolute top-0.75 right-0.75 flex size-11 items-center justify-center rounded-xs text-ink-2 hover:text-ink"
                :aria-label="reveal ? 'Скрыть пароль' : 'Показать пароль'"
                @click="reveal = !reveal"
              >
                <EyeOff v-if="reveal" class="size-4.5" />
                <Eye v-else class="size-4.5" />
              </button>
            </div>
            <p v-if="errors.password" id="auth-pass-err" class="err"><CircleAlert />{{ errors.password }}</p>
            <p v-else-if="!login" id="auth-pass-hint" class="hint">Не короче 8 символов</p>
          </div>
        </fieldset>

        <p v-if="errors.form" class="err" role="alert"><CircleAlert />{{ errors.form }}</p>

        <button type="submit" class="b b-mint w-full" :disabled="sending" :aria-busy="sending">
          <template v-if="sending">
            <LoaderCircle class="animate-spin" aria-hidden="true" />{{ login ? 'Входим' : 'Создаём аккаунт' }}
          </template>
          <template v-else>{{ login ? 'Войти' : 'Создать аккаунт' }}<ArrowRight /></template>
        </button>
        <p class="sr-only" role="status">{{ sending ? (login ? 'Входим' : 'Создаём аккаунт') : '' }}</p>
        <p v-if="!login" class="text-sm text-ink-2">
          Нажимая «Создать аккаунт», вы соглашаетесь с условиями использования и политикой конфиденциальности.
        </p>
      </form>

      <p class="text-sm text-ink-2" data-rv>
        {{ login ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
        <router-link replace :to="login ? '/register' : '/login'" class="ln font-semibold text-ink">
          {{ login ? 'Зарегистрироваться' : 'Войти' }}
        </router-link>
      </p>
    </section>
  </app-onboarding-frame>
</template>

<script setup lang="ts">
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { type Error as ApiError, type AuthResult, register, login as signIn } from '@/api/generated'
import AppOnboardingFrame from '@/components/AppOnboardingFrame.vue'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{ mode: 'register' | 'login' }>()

const router = useRouter()
const { setToken, startPath } = useAuth()
const login = computed(() => props.mode === 'login')
// Почта из подвала лендинга подставляется в регистрацию.
const form = reactive({ name: '', email: String(useRoute().query.email ?? ''), password: '' })
const errors = reactive({ name: '', email: '', password: '', form: '' })
const emailTaken = ref(false)
const reveal = ref(false)
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
