<template>
  <div :inert="open">
    <section v-if="ctl.state.value.kind !== 'sent'" class="flex flex-col gap-10">
      <div v-if="ctl.state.value.kind === 'failed'" class="alert" role="alert">
        <CircleAlertIcon />
        <p class="small"><b>Не удалось разобрать файл.</b> {{ ctl.state.value.message }}</p>
        <button type="button" class="b b-ink b-sm" @click="ctl.reset()">Загрузить заново</button>
      </div>

      <section class="g-drop" aria-labelledby="drop-title" data-rv>
        <div class="drop" :data-over="over || undefined" v-on="drag">
          <span class="drop-ic" aria-hidden="true"><UploadIcon /></span>
          <h2 id="drop-title" class="h-24">Перетащите Excel или CSV — подойдёт таблица в любом виде</h2>
          <p class="small muted">Колонки могут называться как угодно, порядок не важен</p>
          <button type="button" class="b b-ink" @click="startDemo">Выбрать файл</button>
          <label class="ln small cursor-pointer">
            Выбрать свой файл с компьютера
            <input ref="input" class="sr" type="file" accept=".xlsx,.xls,.csv" @change="onPick">
          </label>
        </div>
      </section>

      <div class="next" data-rv>
        <router-link :to="{ path: '/org/onboarding/2' }" class="b b-line b-sm">Назад</router-link>
        <button type="button" class="ln small" :disabled="skipping" @click="skip">Пропустить, загружу позже</button>
      </div>
    </section>

    <section v-else aria-labelledby="done-title" aria-live="polite" data-rv>
      <div class="tile mint done-t">
        <h2 id="done-title" ref="done" class="h-34" tabindex="-1">
          {{ ctl.state.value.sent }}
          {{
            plural(ctl.state.value.sent, 'приглашение отправлено', 'приглашения отправлено', 'приглашений отправлено')
          }}
        </h2>
        <p class="deck text-[18px]">
          Пока спикер не примет приглашение, у него статус «Приглашён». Вы видите только данные из своей таблицы.
        </p>
        <div class="wrow">
          <router-link :to="{ name: 'org.speakers' }" class="b b-ink">Перейти к спикерам<ArrowRightIcon /></router-link>
          <button type="button" class="ln small lnb" @click="ctl.reset()">Загрузить ещё файл</button>
        </div>
      </div>
    </section>
  </div>
  <org-import-window v-if="open" :ctl="ctl" :file-name="fileName" />
</template>

<script setup lang="ts">
import { ArrowRightIcon, CircleAlertIcon, UploadIcon } from '@lucide/vue'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { completeOrganizationOnboarding } from '@/api/demo'
import { demoFile, plural } from '@/components/org/format'
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
