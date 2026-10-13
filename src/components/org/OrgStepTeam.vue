<template>
  <form class="flex flex-col gap-12" novalidate @submit.prevent="submit(emails)">
    <fieldset class="min-w-0" data-rv>
      <legend :class="legendClass">01 / Вы</legend>
      <div class="tile tile-slate flex items-center gap-4 px-6 py-5">
        <org-avatar :name="me" />
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <b class="truncate">{{ me }}</b>
          <span class="truncate font-mono text-sm text-ink-2">{{ user?.email }}</span>
        </div>
        <span class="tag fill-lime">Администратор</span>
      </div>
    </fieldset>

    <fieldset class="min-w-0" data-rv>
      <legend :class="legendClass">02 / Приглашения</legend>
      <div class="flex flex-col gap-3">
        <div v-for="(row, i) in rows" :key="row.id" class="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-2">
          <label class="sr-only" :for="`email-${row.id}`">Почта коллеги {{ i + 1 }}</label>
          <input
            :id="`email-${row.id}`"
            v-model="row.email"
            class="org-inp"
            type="email"
            placeholder="коллега@company.ru"
            autocomplete="off"
            autocapitalize="off"
            :aria-invalid="!!row.error"
          >
          <button
            type="button"
            class="flex size-11 items-center justify-center rounded-full text-ink-2 shadow-[inset_0_0_0_1px_var(--field)] hover:bg-paper-3 hover:text-ink"
            :aria-label="`Убрать строку ${i + 1}`"
            @click="remove(row.id)"
          >
            <Trash2Icon class="size-4" />
          </button>
          <p v-if="row.error" class="org-err col-span-2" role="alert">{{ row.error }}</p>
        </div>
        <div><org-button variant="line" size="sm" @click="add">Добавить ещё</org-button></div>
      </div>
    </fieldset>

    <div
      v-if="save.kind === 'error'"
      class="flex items-center gap-4 rounded-[14px] fill-pink py-3.5 pr-3.5 pl-5"
      role="alert"
    >
      <CircleAlertIcon class="size-5 shrink-0" />
      <p class="min-w-0 flex-1 text-sm"><b>Не удалось отправить приглашения.</b> {{ save.message }}</p>
      <org-button variant="ink" size="sm" @click="submit(emails)">Повторить</org-button>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 pt-7 shadow-[inset_0_1px_0_var(--line)]" data-rv>
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-3">
        <org-button variant="line" :to="{ path: '/org/onboarding/1' }"><ArrowLeftIcon />Назад</org-button>
        <span class="text-sm text-ink-2">Коллеги получат письмо и сразу попадут в интерфейс организации</span>
      </div>
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" class="text-sm" :class="linkClass" :disabled="save.kind === 'saving'" @click="submit([])">
          Пропустить
        </button>
        <org-button type="submit" :disabled="save.kind === 'saving'">
          {{ emails.length ? 'Пригласить и продолжить' : 'Продолжить' }}<ArrowRightIcon />
        </org-button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, ArrowRightIcon, CircleAlertIcon, Trash2Icon } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { inviteColleagues } from '@/api/demo'
import { legendClass, linkClass } from '@/components/org/classes'
import OrgAvatar from '@/components/org/OrgAvatar.vue'
import OrgButton from '@/components/org/OrgButton.vue'
import { useAuth } from '@/composables/useAuth'

type Save = { kind: 'idle' } | { kind: 'saving' } | { kind: 'error'; message: string }
type Row = { id: number; email: string; error: string }

const router = useRouter()
const { user, org, loadOrg } = useAuth()
const save = ref<Save>({ kind: 'idle' })
let nextId = 1
const rows = reactive<Row[]>([{ id: nextId++, email: '', error: '' }])

const me = computed(
  () => org.value?.team.find((member) => member.email === user.value?.email)?.name || user.value?.email || '',
)
const emails = computed(() => rows.map((row) => row.email.trim()).filter(Boolean))

const add = () => {
  rows.push({ id: nextId++, email: '', error: '' })
}

const remove = (id: number) => {
  const index = rows.findIndex((row) => row.id === id)
  rows.splice(index, 1)
  if (!rows.length) add()
}

const submit = async (list: string[]) => {
  for (const row of rows)
    row.error = !row.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim()) ? '' : 'Проверьте адрес'
  if (list.length && rows.some((row) => row.error)) return

  save.value = { kind: 'saving' }
  const res = await inviteColleagues({ emails: list })
  if (res.status !== 200) {
    save.value = { kind: 'error', message: 'Адреса на месте, попробуйте ещё раз.' }
    return
  }
  await loadOrg()
  router.push('/org/onboarding/3')
}
</script>
