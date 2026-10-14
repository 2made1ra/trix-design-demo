<template>
  <form class="flex flex-col gap-12" novalidate @submit.prevent="submit(emails)">
    <fieldset class="fld" data-rv>
      <legend class="idx k muted">01 / Вы</legend>
      <app-tile tone="slate" class="me">
        <span class="ava mint" aria-hidden="true">{{ initials(me) }}</span>
        <div class="me-t">
          <b>{{ me }}</b>
          <span class="small muted mono">{{ user?.email }}</span>
        </div>
        <app-tag tone="lime">Администратор</app-tag>
      </app-tile>
    </fieldset>

    <fieldset class="fld" data-rv>
      <legend class="idx k muted">02 / Приглашения</legend>
      <div class="inv">
        <div v-for="(row, i) in rows" :key="row.id" class="irow">
          <label class="sr" :for="`email-${row.id}`">Почта коллеги {{ i + 1 }}</label>
          <input
            :id="`email-${row.id}`"
            v-model="row.email"
            class="inp"
            type="email"
            placeholder="коллега@company.ru"
            autocomplete="off"
            autocapitalize="off"
            :aria-invalid="!!row.error"
          >
          <button type="button" class="rm" :aria-label="`Убрать строку ${i + 1}`" @click="remove(row.id)">
            <Trash2Icon aria-hidden="true" />
          </button>
          <p v-if="row.error" class="err" role="alert"><CircleAlertIcon />{{ row.error }}</p>
        </div>
        <div><button type="button" class="b b-line b-sm" @click="add">Добавить ещё</button></div>
      </div>
    </fieldset>

    <div v-if="save.kind === 'error'" class="alert" role="alert">
      <CircleAlertIcon />
      <p class="small"><b>Не удалось отправить приглашения.</b> {{ save.message }}</p>
      <button type="button" class="b b-ink b-sm" @click="submit(emails)">Повторить</button>
    </div>

    <div class="next" data-rv>
      <div class="nx-l">
        <router-link :to="{ path: '/org/onboarding/1' }" class="b b-line">Назад</router-link>
        <span class="small muted">Коллеги получат письмо и сразу попадут в интерфейс организации</span>
      </div>
      <div class="nx-r">
        <button type="button" class="ln small" :disabled="save.kind === 'saving'" @click="submit([])">
          Пропустить
        </button>
        <button type="submit" class="b b-mint" :disabled="save.kind === 'saving'">
          {{ emails.length ? 'Пригласить и продолжить' : 'Продолжить' }}<ArrowRightIcon />
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ArrowRightIcon, CircleAlertIcon, Trash2Icon } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { inviteColleagues } from '@/api/demo'
import AppTag from '@/components/AppTag.vue'
import AppTile from '@/components/AppTile.vue'
import { initials } from '@/components/org/format'
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
