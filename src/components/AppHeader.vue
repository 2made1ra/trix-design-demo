<template>
  <header class="z-40" :class="transparent ? 'relative' : 'sticky top-0 border-b border-line-2 bg-paper'">
    <div class="wrap flex min-h-17 flex-wrap items-center justify-between gap-x-8">
      <router-link v-if="!bare" :to="user ? startPath : '/'" class="brand text-ink hover:text-ink">TRIX</router-link>
      <span v-else />

      <nav
        v-if="navLinks.length"
        aria-label="Разделы"
        class="order-3 flex w-full gap-7 overflow-x-auto md:order-none md:mr-auto md:ml-6 md:w-auto"
      >
        <router-link
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="kicker flex h-12 shrink-0 items-center text-ink md:h-17"
          :class="link.active && 'shadow-[inset_0_-2px_0_var(--ink)]'"
          :aria-current="link.active ? 'page' : undefined"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <div v-if="user" ref="menu" class="relative">
        <button
          type="button"
          class="ava fill-mint"
          aria-label="Меню аккаунта"
          :aria-expanded="open"
          @click="open = !open"
        >
          {{ initials }}
        </button>
        <div v-if="open" class="float absolute top-full right-0 z-50 mt-2 flex w-64 flex-col gap-3 p-4">
          <span class="truncate text-sm text-ink-2">{{ user.email }}</span>
          <button type="button" class="b b-line b-sm" @click="signOut">
            <LogOut />
            Выйти из аккаунта
          </button>
        </div>
      </div>
      <div v-else class="flex items-center gap-7">
        <router-link :to="{ name: 'login' }" class="kicker text-ink">Войти</router-link>
        <router-link v-if="!bare" :to="{ name: 'register' }" class="b b-mint b-sm"> Начать<ArrowRight /> </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ArrowRight, LogOut } from '@lucide/vue'
import { onClickOutside } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'
import { type RouteLocationRaw, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

type Link = { label: string; to: RouteLocationRaw; active?: boolean }

const props = defineProps<{
  /** Прозрачная шапка внутри героя лендинга */
  transparent?: boolean
  /** Без логотипа и кнопки «Начать»: развилка */
  bare?: boolean
  /** Якоря лендинга для гостя */
  anchors?: Link[]
}>()

const route = useRoute()
const router = useRouter()
const { user, startPath, logout } = useAuth()
const menu = useTemplateRef<HTMLElement>('menu')
const open = ref(false)

onClickOutside(menu, () => {
  open.value = false
})

const navLinks = computed<Link[]>(() =>
  user.value
    ? [{ label: 'Мероприятия', to: '/events', active: ['events', 'conferences.show'].includes(String(route.name)) }]
    : (props.anchors ?? []),
)
const initials = computed(() => (user.value?.email ?? '').slice(0, 2))

const signOut = async () => {
  open.value = false
  logout()
  await router.push('/')
}
</script>
