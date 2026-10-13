import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import PageCompaniesLanding from '@/pages/org/PageCompaniesLanding.vue'
import PageConnect from '@/pages/org/PageConnect.vue'
import PageInvite from '@/pages/org/PageInvite.vue'
import PageOrgEvents from '@/pages/org/PageOrgEvents.vue'
import PageOrgInvite from '@/pages/org/PageOrgInvite.vue'
import PageOrgOnboarding from '@/pages/org/PageOrgOnboarding.vue'
import PageOrgSpeakers from '@/pages/org/PageOrgSpeakers.vue'
import PageFork from '@/pages/PageFork.vue'
import PageEvent from '@/pages/speaker/PageEvent.vue'
import PageEvents from '@/pages/speaker/PageEvents.vue'
import PageLogin from '@/pages/speaker/PageLogin.vue'
import PageOnboarding from '@/pages/speaker/PageOnboarding.vue'
import PageRegister from '@/pages/speaker/PageRegister.vue'
import PageSpeakersLanding from '@/pages/speaker/PageSpeakersLanding.vue'
import PageTalk from '@/pages/speaker/PageTalk.vue'
import PageTalkNew from '@/pages/speaker/PageTalkNew.vue'

const publicPages = ['home', 'speakers.landing', 'companies.landing', 'connect', 'invite', 'conferences.show']
const guestPages = ['login', 'register']

export const createRoutes = () => {
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) return savedPosition
      if (to.hash) return { el: to.hash, top: 96, behavior: to.path === from.path ? 'smooth' : 'auto' }
      return { top: 0 }
    },
    routes: [
      { component: PageFork, name: 'home', path: '/', meta: { title: 'TRIX' } },
      { component: PageSpeakersLanding, name: 'speakers.landing', path: '/speakers', meta: { title: 'Спикерам' } },
      { component: PageCompaniesLanding, name: 'companies.landing', path: '/companies', meta: { title: 'Компаниям' } },
      { component: PageRegister, name: 'register', path: '/register', meta: { title: 'Регистрация' } },
      { component: PageLogin, name: 'login', path: '/login', meta: { title: 'Вход' } },
      { component: PageOnboarding, name: 'onboarding', path: '/onboarding/:step(\\d+)', meta: { title: 'Знакомство' } },
      { component: PageEvents, name: 'events', path: '/events', meta: { title: 'Мероприятия для вас' } },
      { component: PageEvent, name: 'conferences.show', path: '/c/:slug', meta: { title: 'Мероприятие' } },
      { component: PageTalkNew, name: 'talks.new', path: '/talks/new', meta: { title: 'Загрузка доклада' } },
      { component: PageTalk, name: 'talks.show', path: '/talks/:id', meta: { title: 'Разбор доклада' } },
      { component: PageConnect, name: 'connect', path: '/connect', meta: { title: 'Подключить организацию' } },
      { component: PageInvite, name: 'invite', path: '/invite/:token', meta: { title: 'Приглашение' } },
      {
        component: PageOrgOnboarding,
        name: 'org.onboarding',
        path: '/org/onboarding/:step(\\d+)',
        meta: { title: 'Онбординг организации' },
      },
      { component: PageOrgSpeakers, name: 'org.speakers', path: '/org/speakers', meta: { title: 'Спикеры' } },
      { component: PageOrgEvents, name: 'org.events', path: '/org/events', meta: { title: 'Мероприятия организации' } },
      {
        component: PageOrgInvite,
        name: 'org.events.invite',
        path: '/org/events/:id/invite',
        meta: { title: 'Кого позвать' },
      },
    ],
  })

  router.beforeEach(async (to) => {
    const name = String(to.name)
    const auth = useAuth()

    // Пользователь нужен и на публичных страницах: от него зависят шапка и кнопки.
    if (localStorage.getItem('token') && !auth.user.value) await auth.fetchMe()
    if (!auth.user.value) return publicPages.includes(name) || guestPages.includes(name) ? undefined : '/login'
    if (guestPages.includes(name)) return auth.startPath.value
    if (publicPages.includes(name)) return

    const orgPage = name.startsWith('org.')
    if (orgPage) {
      if (!auth.isOrgAdmin.value) return auth.startPath.value
      const step = auth.org.value?.step
      if (name === 'org.onboarding') {
        // После онбординга остаётся импорт спикеров из Excel (шаг 3).
        if (!step) return to.params.step === '3' ? undefined : '/org/speakers'
        // Вперёд по шагам не перескочить, назад можно.
        if (Number(to.params.step) > step || Number(to.params.step) < 1) return `/org/onboarding/${step}`
        return
      }
      if (step) return `/org/onboarding/${step}`
      return
    }

    if (auth.role.value === 'org-admin') return auth.startPath.value
    if (name === 'onboarding') {
      // Прошедший онбординг возвращается сюда из подборки, чтобы поменять профиль.
      if (Number(to.params.step) > 3 || Number(to.params.step) < 1) return '/onboarding/1'
      return
    }
    if (auth.needsOnboarding.value) return '/onboarding/1'
  })

  router.afterEach((to) => {
    const title = to.meta.title
    document.title = typeof title === 'string' ? `${title} | TRIX` : 'TRIX'
  })

  return router
}
