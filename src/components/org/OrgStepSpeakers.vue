<template>
  <div :inert="open">
    <section v-if="ctl.state.value.kind !== 'sent'" class="flex flex-col gap-10">
      <div
        v-if="ctl.state.value.kind === 'failed'"
        class="flex items-center gap-4 rounded-[14px] fill-pink py-3.5 pr-3.5 pl-5"
        role="alert"
      >
        <CircleAlertIcon class="size-5 shrink-0" />
        <p class="min-w-0 flex-1 text-sm"><b>Не удалось разобрать файл.</b> {{ ctl.state.value.message }}</p>
        <org-button variant="ink" size="sm" @click="ctl.reset()">Загрузить заново</org-button>
      </div>

      <section aria-labelledby="drop-title" data-rv>
        <div
          class="flex flex-col items-center gap-4 rounded-[18px] bg-paper-2 px-6 py-18 text-center outline-1 -outline-offset-1 outline-quiet outline-dashed transition-colors hover:bg-paper-3"
          :class="over && 'bg-paper-3'"
          v-on="drag"
        >
          <span
            class="flex size-14 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_var(--field)]"
            aria-hidden="true"
          >
            <UploadIcon class="size-6" />
          </span>
          <h2 id="drop-title" class="max-w-130 text-2xl leading-[1.1] font-bold">
            Перетащите Excel или CSV — подойдёт таблица в любом виде
          </h2>
          <p class="text-sm text-ink-2">Колонки могут называться как угодно, порядок не важен</p>
          <org-button variant="ink" @click="startDemo">Выбрать файл</org-button>
          <label class="cursor-pointer text-sm text-ink-2 shadow-[inset_0_-1px_0_currentColor] hover:text-ink">
            Выбрать свой файл с компьютера
            <input ref="input" class="sr-only" type="file" accept=".xlsx,.xls,.csv" @change="onPick">
          </label>
        </div>
      </section>

      <div class="flex flex-wrap items-center justify-between gap-4 pt-7 shadow-[inset_0_1px_0_var(--line)]" data-rv>
        <org-button variant="line" size="sm" :to="{ path: '/org/onboarding/2' }"><ArrowLeftIcon />Назад</org-button>
        <button type="button" class="text-sm" :class="linkClass" :disabled="skipping" @click="skip">
          Пропустить, загружу позже
        </button>
      </div>
    </section>

    <section v-else class="flex max-w-140 flex-col gap-0" aria-labelledby="done-title" aria-live="polite">
      <div class="tile surface-mint flex flex-col items-start gap-5 p-10">
        <h2 id="done-title" ref="done" class="shout text-d3 outline-none" tabindex="-1">
          {{ ctl.state.value.sent }}
          {{
            plural(ctl.state.value.sent, 'приглашение отправлено', 'приглашения отправлено', 'приглашений отправлено')
          }}
        </h2>
        <p class="text-lg leading-normal text-ink-2">
          Пока спикер не примет приглашение, у него статус «Приглашён». Вы видите только данные из своей таблицы.
        </p>
        <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
          <org-button variant="ink" :to="{ name: 'org.speakers' }">Перейти к спикерам<ArrowRightIcon /></org-button>
          <button type="button" class="text-sm" :class="linkClass" @click="ctl.reset()">Загрузить ещё файл</button>
        </div>
      </div>
    </section>
  </div>
  <org-import-window v-if="open" :ctl="ctl" :file-name="fileName" />
</template>

<script setup lang="ts">
import { ArrowLeftIcon, ArrowRightIcon, CircleAlertIcon, UploadIcon } from '@lucide/vue'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { completeOrganizationOnboarding } from '@/api/demo'
import { linkClass } from '@/components/org/classes'
import { demoFile, plural } from '@/components/org/format'
import OrgButton from '@/components/org/OrgButton.vue'
import OrgImportWindow from '@/components/org/OrgImportWindow.vue'
import { useSpeakerImport } from '@/components/org/useSpeakerImport'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { loadOrg } = useAuth()
const ctl = useSpeakerImport()
const input = useTemplateRef<HTMLInputElement>('input')
const done = useTemplateRef<HTMLElement>('done')
const over = ref(false)
const skipping = ref(false)

const open = computed(() => ctl.stage.value !== null)
const fileName = computed(() => {
  const s = ctl.state.value
  return s.kind === 'creating' ? s.fileName : s.kind === 'running' ? s.imp.file_name : ''
})

// Клик без выбранного файла подставляет демо-файл, свой файл берётся из поля или перетаскиванием.
const startDemo = () => ctl.start(demoFile())

const onPick = () => {
  const file = input.value?.files?.[0]
  if (input.value) input.value.value = ''
  if (file) ctl.start(file)
}

const onDrop = (event: DragEvent) => {
  over.value = false
  const file = event.dataTransfer?.files[0]
  ctl.start(file ?? demoFile())
}

// Перетаскивание — дополнение для мыши, с клавиатуры файл выбирается кнопкой.
const drag = {
  dragover: (event: DragEvent) => {
    event.preventDefault()
    over.value = true
  },
  dragleave: () => {
    over.value = false
  },
  drop: (event: DragEvent) => {
    event.preventDefault()
    onDrop(event)
  },
}

const skip = async () => {
  skipping.value = true
  const res = await completeOrganizationOnboarding()
  if (res.status !== 200) {
    skipping.value = false
    return void toast.error(res.data.message)
  }
  await loadOrg()
  router.push({ name: 'org.speakers' })
}

watch(
  () => ctl.state.value.kind,
  async (kind) => {
    if (kind !== 'sent') return
    await nextTick()
    done.value?.focus()
  },
)

defineExpose({ skip })
</script>
