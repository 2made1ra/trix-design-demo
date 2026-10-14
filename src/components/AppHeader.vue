<template>
  <header class="nav" :class="{ bare: variant === 'landing' || variant === 'fork' }">
    <div class="wrap">
      <template v-if="variant !== 'fork'">
        <router-link :to="home" class="brand">TRIX</router-link>
        <nav
          v-if="links.length"
          :aria-label="variant === 'landing' ? 'Основное меню' : 'Разделы'"
          class="links"
          :class="{ left: !landing }"
        >
          <router-link
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            :aria-current="link.active ? 'page' : undefined"
          >
            {{ link.label }}
          </router-link>
        </nav>
      </template>

      <div
        class="flex items-center max-sm:gap-4"
        :class="[variant === 'org' ? 'gap-4' : 'gap-7', { 'ml-auto': variant === 'fork' }]"
      >
        <nav v-if="variant === 'org' && isSpeaker" class="sw" aria-label="Режим кабинета">
          <span aria-current="page">Организация</span>
          <router-link :to="{ name: 'events' }">Личное</router-link>
        </nav>

        <template v-if="!user">
          <router-link :to="{ name: 'login' }" class="k">Войти</router-link>
          <router-link v-if="variant !== 'fork'" :to="join" class="b b-mint b-sm">
            {{ joinLabel }}<ArrowRight v-if="landing" />
          </router-link>
        </template>
        <router-link v-else-if="landing" :to="startPath" class="b b-mint b-sm max-sm:hidden">
          В кабинет<ArrowRight />
        </router-link>

        <div v-if="user" ref="menu" class="relative">
          <button
            type="button"
            class="ava"
            :class="variant === 'org' || company ? 'lime' : 'mint'"
            :aria-label="variant === 'org' ? 'Профиль организации' : 'Меню аккаунта'"
            :aria-expanded="open"
            @click="open = !open"
          >
            {{ initials }}
          </button>
          <div v-if="open" class="float absolute top-full right-0 z-50 mt-2 flex w-64 flex-col gap-3 p-4">
            <div class="min-w-0">
              <div v-if="variant === 'org'" class="truncate font-semibold">{{ org?.name }}</div>
              <div class="truncate text-sm text-ink-2">{{ user.email }}</div>
            </div>
            <button type="button" class="b b-line b-sm" @click="signOut">
              <LogOut />
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ArrowRight, LogOut } from '@lucide/vue'
import { onClickOutside } from '@vueuse/core'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { type RouteLocationRaw, useRoute, useRouter } from 'vue-router'
import { listOrgEvents } from '@/api/demo'
import { useAuth } from '@/composables/useAuth'

type Link = { label: string; to: RouteLocationRaw; active?: boolean }

const props = withDefaults(
  defineProps<{
    /** Шапка лендинга, развилки, кабинета спикера или кабинета организации */
    variant?: 'landing' | 'fork' | 'cabinet' | 'org'
    side?: 'sp' | 'co'
    /** Якоря лендинга */
    anchors?: { label: string; hash: string }[]
    /** Какой раздел кабинета подсветить, если страница сама решает (разбор в ожидании — «Мероприятия») */
    current?: 'events' | 'talks'
  }>(),
  { variant: 'cabinet', side: 'sp' },
)

const route = useRoute()
const router = useRouter()
const { user, org, isSpeaker, startPath, logout } = useAuth()
const menu = useTemplateRef<HTMLElement>('menu')
const open = ref(false)
const nextEventId = ref<string | null>(null)

onClickOutside(menu, () => {
  open.value = false
})

onMounted(async () => {
  if (props.variant !== 'org') return
  const res = await listOrgEvents()
  if (res.status === 200) nextEventId.value = res.data.upcoming[0]?.id ?? null
})

const landing = computed(() => props.variant === 'landing')
const company = computed(() => props.side === 'co')
const name = computed(() => String(route.name))
const home = computed<RouteLocationRaw>(() => {
  if (props.variant === 'landing') return { name: 'home' }
  if (props.variant === 'org') return { name: 'companies.landing' }
  return user.value ? startPath.value : { name: 'speakers.landing' }
})
const join = computed<RouteLocationRaw>(() =>
  landing.value && company.value ? { name: 'connect' } : { name: 'register' },
)
const joinLabel = computed(() => (landing.value && company.value ? 'Подключить организацию' : 'Начать'))

const section = computed(() => {
  if (props.current) return props.current
  return ['events', 'conferences.show', 'talks.new'].includes(name.value)
    ? 'events'
    : name.value.startsWith('talks.')
      ? 'talks'
      : null
})

const links = computed<Link[]>(() => {
  if (props.variant === 'landing') return (props.anchors ?? []).map((a) => ({ label: a.label, to: { hash: a.hash } }))
  if (props.variant === 'cabinet') {
    const items: Link[] = [{ label: 'Мероприятия', to: { name: 'events' }, active: section.value === 'events' }]
    if (user.value)
      items.push(
        { label: 'Мои доклады', to: { name: 'talks.new' }, active: section.value === 'talks' },
        { label: 'Развитие', to: { name: 'speakers.landing', hash: '#growth' } },
      )
    return items
  }
  if (props.variant === 'org')
    return [
      { label: 'Новые выступления', to: { name: 'org.speakers', hash: '#new' } },
      { label: 'Спикеры', to: { name: 'org.speakers' }, active: name.value === 'org.speakers' },
      { label: 'Мероприятия', to: { name: 'org.events' }, active: name.value === 'org.events' },
      {
        label: 'Кого позвать',
        to: nextEventId.value
          ? { name: 'org.events.invite', params: { id: nextEventId.value } }
          : { name: 'org.events' },
        active: name.value === 'org.events.invite',
      },
    ]
  return []
})

const initials = computed(() => {
  if (props.variant !== 'org') return (user.value?.email ?? '').slice(0, 2)
  return (org.value?.name ?? 'Организация')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
})

const signOut = async () => {
  open.value = false
  logout()
  await router.push(props.variant === 'org' ? { name: 'companies.landing' } : '/')
}
</script>
