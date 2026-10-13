<template>
  <org-split>
    <template #card>
      <span class="kicker text-ink-2">Закрытая бета · для компаний</span>
      <p class="text-2xl leading-[1.05] font-bold">Все ваши спикеры в одном окне</p>
      <ul class="ticks text-sm">
        <li>Эксперты сами вносят выступления, вы подтверждаете</li>
        <li>Видно, кто, где и как выступил</li>
        <li>Подскажем, кого позвать на мероприятие</li>
      </ul>
    </template>
    <template #big>TRIX<span class="font-light text-ink/30">.</span></template>

    <section v-if="state.kind === 'form'" class="flex max-w-140 flex-col gap-10" aria-labelledby="form-title">
      <div class="flex flex-col gap-4" data-rv>
        <span class="tag fill-lime self-start">Компаниям</span>
        <h1 id="form-title" class="shout text-d1">Подключить организацию</h1>
        <p class="text-xl leading-[1.55] text-ink-2">
          Оставьте заявку: проверим организацию и пришлём приглашение администратору на рабочую почту.
        </p>
      </div>
      <form class="flex flex-col gap-7" novalidate data-rv @submit.prevent="submit">
        <fieldset class="flex min-w-0 flex-col gap-6">
          <div class="flex flex-col gap-2.5">
            <label for="org-name" class="org-label">Название организации</label>
            <input
              id="org-name"
              v-model="form.name"
              class="org-inp"
              type="text"
              autocomplete="organization"
              placeholder="Как называется компания"
              :aria-invalid="!!errors.name"
              :aria-describedby="errors.name ? 'org-name-err' : undefined"
            >
            <p v-if="errors.name" id="org-name-err" class="org-err" role="alert">{{ errors.name }}</p>
          </div>
          <div class="flex flex-col gap-2.5">
            <label for="org-email" class="org-label">Рабочая почта</label>
            <input
              id="org-email"
              v-model="form.email"
              class="org-inp"
              type="email"
              autocomplete="email"
              placeholder="you@company.ru"
              :aria-invalid="!!errors.email"
              aria-describedby="org-email-hint"
            >
            <p v-if="errors.email" class="org-err" role="alert">{{ errors.email }}</p>
            <p id="org-email-hint" class="text-[13px] leading-normal text-ink-2">Сюда придёт приглашение</p>
          </div>
          <div class="flex flex-col gap-2.5">
            <label for="org-site" class="org-label">Сайт</label>
            <input
              id="org-site"
              v-model="form.site"
              class="org-inp"
              type="url"
              autocomplete="url"
              placeholder="https://company.ru"
            >
          </div>
          <div class="flex flex-col gap-2">
            <label class="org-agree">
              <input v-model="form.consent" type="checkbox">
              <span class="bx" aria-hidden="true"><CheckIcon /></span>
              <span>Согласен на обработку персональных данных по политике конфиденциальности</span>
            </label>
            <p v-if="errors.consent" class="org-err" role="alert">{{ errors.consent }}</p>
          </div>
        </fieldset>
        <org-button type="submit" block :disabled="sending"> Отправить заявку<ArrowRightIcon /> </org-button>
      </form>
      <p class="text-sm text-ink-2" data-rv>
        Уже в команде?
        <router-link :to="{ name: 'login' }" class="font-semibold text-ink shadow-[inset_0_-1px_0_currentColor]"
          >Войти</router-link
        >
      </p>
    </section>

    <section v-else class="flex max-w-140 flex-col gap-10" aria-labelledby="sent-title" aria-live="polite">
      <div class="flex flex-col gap-6" data-rv>
        <span class="flex size-16 items-center justify-center rounded-full fill-lime" aria-hidden="true">
          <CheckIcon class="size-7" />
        </span>
        <h1 id="sent-title" class="shout text-d1">Заявка принята, ответим на почту</h1>
        <p class="text-xl leading-[1.55] text-ink-2">
          Мы проверим организацию и пришлём приглашение администратору на указанную почту. Обычно это занимает один–два
          рабочих дня.
        </p>
      </div>
      <div class="flex flex-wrap gap-3" data-rv>
        <org-button :to="{ name: 'companies.landing' }">На главную<ArrowRightIcon /></org-button>
        <org-button variant="line" :to="{ name: 'invite', params: { token: state.token } }">
          Открыть приглашение из письма
        </org-button>
      </div>
    </section>
  </org-split>
</template>

<script setup lang="ts">
import { ArrowRightIcon, CheckIcon } from '@lucide/vue'
import { reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { createOrgApplication } from '@/api/demo'
import OrgButton from '@/components/org/OrgButton.vue'
import OrgSplit from '@/components/org/OrgSplit.vue'

type State = { kind: 'form' } | { kind: 'sent'; token: string }

const state = ref<State>({ kind: 'form' })
const sending = ref(false)
const form = reactive({ name: '', email: '', site: '', consent: false })
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
