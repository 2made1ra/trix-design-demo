<template>
  <div class="field" v-bind="root">
    <span v-if="kicker" class="idx k muted" aria-hidden="true">{{ kicker }}</span>
    <div v-if="$slots.aside" class="flex items-baseline justify-between gap-4">
      <label :for="id"><slot name="label">{{ label }}</slot></label>
      <slot name="aside" />
    </div>
    <label v-else :for="id"><slot name="label">{{ label }}</slot></label>

    <slot :id="id" :describedby="describedby" :invalid="invalid">
      <div v-if="type === 'password'" class="pw">
        <input
          :id="id"
          v-model="model"
          class="inp"
          :type="reveal ? 'text' : 'password'"
          :aria-invalid="invalid"
          v-bind="control"
          :aria-describedby="describedby"
        >
        <button type="button" :aria-label="reveal ? 'Скрыть пароль' : 'Показать пароль'" @click="reveal = !reveal">
          <EyeOff v-if="reveal" />
          <Eye v-else />
        </button>
      </div>
      <textarea
        v-else-if="multiline"
        :id="id"
        v-model="model"
        class="inp"
        :aria-invalid="invalid"
        v-bind="control"
        :aria-describedby="describedby"
      />
      <input
        v-else
        :id="id"
        v-model="model"
        class="inp"
        :type="type"
        :aria-invalid="invalid"
        v-bind="control"
        :aria-describedby="describedby"
      >
    </slot>

    <p v-if="invalid" :id="`${id}-err`" class="err" role="alert">
      <CircleAlert /><slot name="error">{{ error }}</slot>
    </p>
    <p v-else-if="hint || $slots.hint" :id="`${id}-hint`" class="hint"><slot name="hint">{{ hint }}</slot></p>
  </div>
</template>

<script setup lang="ts">
import { CircleAlert, Eye, EyeOff } from '@lucide/vue'
import { computed, ref, useAttrs, useId, useSlots } from 'vue'

/**
 * Поле формы: подпись, инпут, ошибка или подсказка, связанные через `aria-describedby`.
 * Атрибуты (`placeholder`, `autocomplete`, `rows`, обработчики) уходят на инпут, `class`, `style` и `data-*` — на обёртку.
 * Нестандартный контрол (select, своя разметка) — в слот по умолчанию, он получает `id`, `describedby`, `invalid`.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label?: string
    /** Кикер над подписью, например «01 / Доклад» */
    kicker?: string
    hint?: string
    /** Текст ошибки; ошибка заменяет подсказку */
    error?: string | null
    type?: string
    multiline?: boolean
    id?: string
  }>(),
  { type: 'text' },
)

const model = defineModel<string | number | null>()

const attrs = useAttrs()
const slots = useSlots()
const autoId = useId()
const id = computed(() => props.id ?? autoId)
const invalid = computed(() => !!props.error)
const reveal = ref(false)

const isRoot = (key: string) => key === 'class' || key === 'style' || key.startsWith('data-')
const root = computed(() => Object.fromEntries(Object.entries(attrs).filter(([key]) => isRoot(key))))
const control = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => !isRoot(key) && key !== 'aria-describedby')),
)

const describedby = computed(() => {
  const own = invalid.value ? `${id.value}-err` : props.hint || slots.hint ? `${id.value}-hint` : ''
  return [own, attrs['aria-describedby']].filter(Boolean).join(' ') || undefined
})
</script>
