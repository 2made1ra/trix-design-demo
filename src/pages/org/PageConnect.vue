<template>
  <app-onboarding-frame side="co" :home="{ name: 'companies.landing' }" big="TRIX" sub="." :footer="false">
    <template #float>
      <span class="k muted">Закрытая бета · для компаний</span>
      <p class="h-24">Все ваши спикеры в одном окне</p>
      <ul class="ticks small">
        <li>Эксперты сами вносят выступления, вы подтверждаете</li>
        <li>Видно, кто, где и как выступил</li>
        <li>Подскажем, кого позвать на мероприятие</li>
      </ul>
    </template>

    <section v-if="state.kind === 'form'" class="pnl" aria-labelledby="form-title">
      <div class="flex flex-col gap-4" data-rv>
        <span class="tag lime self-start">Компаниям</span>
        <h1 id="form-title" class="d-1">Подключить организацию</h1>
        <p class="deck text-[20px]">
          Оставьте заявку: проверим организацию и пришлём приглашение администратору на рабочую почту.
        </p>
      </div>
      <form class="flex flex-col gap-7" novalidate data-rv @submit.prevent="submit">
        <fieldset class="fs">
          <app-field
            id="org-name"
            v-model="form.name"
            label="Название организации"
            autocomplete="organization"
            placeholder="Как называется компания"
            :error="errors.name"
          />
          <app-field
            id="org-email"
            v-model="form.email"
            label="Рабочая почта"
            type="email"
            autocomplete="email"
            placeholder="you@company.ru"
            :error="errors.email"
            hint="Сюда придёт приглашение"
          />
          <app-field
            id="org-site"
            v-model="form.site"
            label="Сайт"
            type="url"
            autocomplete="url"
            placeholder="https://company.ru"
          />
          <div class="flex flex-col gap-2">
            <label class="agree">
              <input v-model="form.consent" type="checkbox">
              <span class="bx" aria-hidden="true"><CheckIcon /></span>
              <span>
                Согласен на обработку персональных данных по
                <a href="#privacy-policy" class="ln">политике конфиденциальности</a>
              </span>
            </label>
            <p v-if="errors.consent" class="err" role="alert"><CircleAlertIcon />{{ errors.consent }}</p>
          </div>
        </fieldset>
        <button type="submit" class="b b-mint go" :disabled="sending">Отправить заявку<ArrowRightIcon /></button>
      </form>
      <p class="small muted" data-rv>
        Уже в команде?
        <router-link :to="{ name: 'login' }" class="ln font-semibold text-ink">Войти</router-link>
      </p>
    </section>

    <section v-else-if="state.kind === 'sent'" class="pnl" aria-labelledby="sent-title" aria-live="polite">
      <div class="flex flex-col gap-6" data-rv>
        <span class="done" aria-hidden="true"><CheckIcon /></span>
        <h1 id="sent-title" class="d-1">Заявка принята, ответим на почту</h1>
        <p class="deck text-[20px]">
          Мы проверим организацию и пришлём приглашение администратору на указанную почту. Обычно это занимает один–два
          рабочих дня.
        </p>
      </div>
      <div class="acts" data-rv>
        <router-link :to="{ name: 'companies.landing' }" class="b b-mint">На главную<ArrowRightIcon /></router-link>
        <router-link :to="{ name: 'invite', params: { token: state.token } }" class="b b-line">
          Открыть приглашение из письма
        </router-link>
      </div>
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
import { ArrowRightIcon, CheckIcon, CircleAlertIcon } from '@lucide/vue'
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { createOrgApplication } from '@/api/demo'
import AppField from '@/components/AppField.vue'
import AppOnboardingFrame from '@/components/AppOnboardingFrame.vue'

type State = { kind: 'form' } | { kind: 'sent'; token: string }

const state = ref<State>({ kind: 'form' })
const sending = ref(false)
// Почта из подвала лендинга подставляется в заявку.
const form = reactive({ name: '', email: String(useRoute().query.email ?? ''), site: '', consent: false })
const errors = reactive({ name: '', email: '', consent: '' })

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Укажите название организации'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ? ''
    : 'Укажите рабочую почту, например you@company.ru'
  errors.consent = form.consent ? '' : 'Нужно согласие на обработку данных'
  return !errors.name && !errors.email && !errors.consent
}

const submit = async () => {
  if (!validate()) return
  sending.value = true
  const res = await createOrgApplication({
    name: form.name,
    email: form.email,
    site: form.site || undefined,
    consent: form.consent,
  })
  sending.value = false
  if (res.status !== 201) return void toast.error(res.data.message)
  state.value = { kind: 'sent', token: res.data.invite_token }
}
</script>
