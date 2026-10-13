<template>
  <div class="design design-mesh fr flex min-h-dvh flex-col" :class="{ calm, co: side === 'co' }">
    <div class="flex min-h-0 flex-1 flex-col">
      <slot />
    </div>
    <app-footer v-if="footer" :variant="footer" :side="side" />
  </div>
</template>

<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'

withDefaults(
  defineProps<{
    calm?: boolean
    /** Сторона: у компаний акцент лайм и свои ссылки подвала */
    side?: 'sp' | 'co'
    /** Подвал страницы: полный на лендингах, строка на развилке, короткий на остальных */
    footer?: 'full' | 'mini' | 'fork' | false
  }>(),
  { calm: true, side: 'sp', footer: 'mini' },
)
</script>
