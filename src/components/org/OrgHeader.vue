<template>
  <header class="sticky top-0 z-40 border-b border-line-2 bg-paper font-sans">
    <div class="mx-auto flex min-h-17 max-w-360 flex-wrap items-center justify-between gap-x-8 px-4 sm:px-8 lg:px-16">
      <div class="flex flex-wrap items-center gap-x-14">
        <router-link :to="{ name: 'org.speakers' }" class="brand text-ink hover:text-ink">TRIX</router-link>
        <nav aria-label="Разделы" class="order-3 flex w-full gap-7 overflow-x-auto md:order-none md:w-auto">
          <router-link
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="flex h-12 shrink-0 items-center text-[15px] text-ink transition-colors hover:text-link md:h-17"
            :class="link.active && 'shadow-[inset_0_-2px_0_var(--ink)]'"
            :aria-current="link.active ? 'page' : undefined"
          >
            {{ link.label }}
          </router-link>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <nav class="org-seg" aria-label="Режим кабинета">
          <span aria-current="page">Организация</span>
          <router-link v-if="isSpeaker" :to="{ name: 'events' }">Личное</router-link>
        </nav>
        <div ref="menu" class="relative">
          <button
            type="button"
            class="flex rounded-full"
            aria-label="Меню организации"
            :aria-expanded="open"
            @click="open = !open"
          >
            <org-avatar :name="org?.name ?? 'Организация'" tone="lime" />
          </button>
          <div
            v-if="open"
            class="absolute top-full right-0 z-50 mt-2 flex w-64 flex-col gap-3 rounded-2xl bg-paper p-4 shadow-[inset_0_0_0_1px_var(--line),0_24px_48px_-24px_rgb(0_0_0/30%)]"
          >
            <div class="min-w-0">
              <div class="truncate font-semibold">{{ org?.name }}</div>
              <div class="truncate text-sm text-ink-2">{{ user?.email }}</div>
            </div>
            <button
              type="button"
              class="kicker self-start shadow-[inset_0_-1px_0_currentColor] hover:text-link"
              @click="exit"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listOrgEvents } from '@/api/demo'
import OrgAvatar from '@/components/org/OrgAvatar.vue'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, org, isSpeaker, logout } = useAuth()
const menu = useTemplateRef<HTMLElement>('menu')
const open = ref(false)
const nextEventId = ref<string | null>(null)

onClickOutside(menu, () => {
  open.value = false
})

onMounted(async () => {
  const res = await listOrgEvents()
  if (res.status === 200) nextEventId.value = res.data.upcoming[0]?.id ?? null
})

const name = computed(() => String(route.name))
const links = computed(() => [
  { label: 'Новые выступления', to: { name: 'org.speakers', hash: '#new' }, active: false },
  { label: 'Спикеры', to: { name: 'org.speakers' }, active: name.value === 'org.speakers' },
  { label: 'Мероприятия', to: { name: 'org.events' }, active: name.value === 'org.events' },
  {
    label: 'Кого позвать',
    to: nextEventId.value ? { name: 'org.events.invite', params: { id: nextEventId.value } } : { name: 'org.events' },
    active: name.value === 'org.events.invite',
  },
])

const exit = () => {
  logout()
  router.push({ name: 'companies.landing' })
}
</script>
