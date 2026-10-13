<template>
  <footer v-if="variant === 'fork'" class="wrap fork-foot k muted">
    <router-link to="/" class="brand" aria-label="TRIX">TRIX</router-link>
    <nav aria-label="Проект">
      <a href="#team">Команда</a><a :href="contactHref">Контакты</a
      ><a href="#privacy-policy">Политика конфиденциальности</a>
      <button type="button" class="uppercase hover:text-link" :disabled="busy" @click="resetDemoState">
        Сбросить демо
      </button>
    </nav>
    <span>© 2026 TRIX</span>
  </footer>

  <footer v-else-if="variant === 'mini'" class="wrap">
    <div class="ff ff-mini">
      <router-link :to="company ? { name: 'companies.landing' } : { name: 'speakers.landing' }" class="brand"
        >TRIX</router-link
      >
      <nav class="ff-links small" aria-label="Подвал">
        <router-link v-for="link in miniLinks" :key="link.label" :to="link.to">{{ link.label }}</router-link>
      </nav>
      <div class="k muted ff-legal">
        <span>© 2026 TRIX</span>
        <span>
          <a href="#privacy-policy">Конфиденциальность</a>
          <button type="button" :disabled="busy" @click="resetDemoState">Сбросить демо</button>
        </span>
      </div>
    </div>
  </footer>

  <footer v-else class="wrap pb-12">
    <div class="ff">
      <div class="ff-main">
        <form class="ff-sub" novalidate @submit.prevent="subscribe">
          <div class="ff-head">
            <span class="k">{{ company ? 'Подключить организацию' : 'Начать' }}</span>
            <h2 class="d-2">{{ company ? 'Подключите свою компанию' : 'Начните с одного выступления' }}</h2>
          </div>
          <div class="ff-field">
            <label for="footer-email" class="k muted">{{ company ? 'Рабочая почта' : 'Электронная почта' }}</label>
            <div class="ff-form">
              <input
                id="footer-email"
                v-model="email"
                class="inp"
                type="email"
                autocomplete="email"
                :placeholder="company ? 'devrel@company.ru' : 'you@example.com'"
              >
              <button type="submit" class="icon-btn" :aria-label="company ? 'Оставить заявку' : 'Зарегистрироваться'">
                <ArrowRight />
              </button>
            </div>
          </div>
        </form>
        <div class="ff-cols small">
          <div v-for="col in cols" :key="col.title">
            <span class="k muted">{{ col.title }}</span>
            <component
              :is="link.to ? 'router-link' : 'a'"
              v-for="link in col.links"
              :key="link.label"
              :to="link.to"
              :href="link.href"
            >
              {{ link.label }}
            </component>
          </div>
        </div>
      </div>
      <div class="ff-base">
        <span class="brand">TRIX</span>
        <div class="k muted ff-legal">
          <span>© 2026 TRIX</span>
          <span>
            <a href="#privacy-policy">Политика конфиденциальности</a>
            <button type="button" :disabled="busy" @click="resetDemoState">Сбросить демо</button>
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { computed, ref } from 'vue'
import { type RouteLocationRaw, useRouter } from 'vue-router'
import { resetDemo } from '@/api/demo'
import { useAuth } from '@/composables/useAuth'

type FootLink = { label: string; to?: RouteLocationRaw; href?: string }

const props = withDefaults(
  defineProps<{
    /** Полный подвал лендингов, короткий внутренних страниц, строка развилки */
    variant?: 'full' | 'mini' | 'fork'
    side?: 'sp' | 'co'
  }>(),
  { variant: 'mini', side: 'sp' },
)

const router = useRouter()
const { logout } = useAuth()
const busy = ref(false)
const email = ref('')

const company = computed(() => props.side === 'co')
const contactHref = 'mailto:hello@trixy.space'

const speakerHash = (hash: string): RouteLocationRaw => ({ name: 'speakers.landing', hash })
const companyHash = (hash: string): RouteLocationRaw => ({ name: 'companies.landing', hash })

const miniLinks = computed<{ label: string; to: RouteLocationRaw }[]>(() =>
  company.value
    ? [
        { label: 'Спикеры', to: { name: 'org.speakers' } },
        { label: 'Мероприятия', to: { name: 'org.events' } },
        { label: 'Кого позвать', to: { name: 'org.events' } },
      ]
    : [
        { label: 'Мероприятия', to: { name: 'events' } },
        { label: 'Разбор доклада', to: { name: 'talks.new' } },
        { label: 'Развитие', to: speakerHash('#growth') },
        { label: 'Организаторам', to: { name: 'companies.landing' } },
      ],
)

const project: FootLink[] = [
  { label: 'Команда', href: '#team' },
  { label: 'Контакты', href: contactHref },
]
const cols = computed<{ title: string; links: FootLink[] }[]>(() =>
  company.value
    ? [
        {
          title: 'Компаниям',
          links: [
            { label: 'Как это работает', to: companyHash('#how') },
            { label: 'Спикеры', to: companyHash('#speakers') },
            { label: 'Кого позвать', to: companyHash('#invite') },
            { label: 'Дашборд', to: companyHash('#dash') },
          ],
        },
        {
          title: 'Спикерам',
          links: [
            { label: 'Портфолио', to: speakerHash('#portfolio') },
            { label: 'Подборка мероприятий', to: speakerHash('#selection') },
            { label: 'Разбор доклада', to: speakerHash('#review') },
          ],
        },
        { title: 'Проект', links: project },
      ]
    : [
        {
          title: 'Спикерам',
          links: [
            { label: 'Портфолио', to: speakerHash('#portfolio') },
            { label: 'Подборка мероприятий', to: speakerHash('#selection') },
            { label: 'Разбор доклада', to: speakerHash('#review') },
            { label: 'Развитие', to: speakerHash('#growth') },
          ],
        },
        {
          title: 'Компаниям',
          links: [
            { label: 'Как это работает', to: companyHash('#how') },
            { label: 'Подключить организацию', to: { name: 'connect' } },
          ],
        },
        { title: 'Проект', links: project },
      ],
)

// Почта из подвала подставляется в форму регистрации или заявки организации.
const subscribe = () => {
  const value = email.value.trim()
  router.push({ name: company.value ? 'connect' : 'register', query: value ? { email: value } : {} })
}

// Полная перезагрузка вместо router.push: так не остаётся состояния страниц от прошлого прогона демо.
const resetDemoState = async () => {
  busy.value = true
  await resetDemo()
  logout()
  window.location.assign('/')
}
</script>
