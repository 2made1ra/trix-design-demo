<template>
  <div ref="root" class="design design-mesh fr calm co org flex min-h-dvh flex-col">
    <app-header v-if="header" variant="org" />
    <div class="flex flex-1 flex-col">
      <slot />
    </div>
    <app-footer v-if="footer" side="co" />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useFx, useScenes } from '@/composables/useFx'

withDefaults(defineProps<{ header?: boolean; footer?: boolean }>(), { footer: true })
const root = useTemplateRef<HTMLElement>('root')

// Набора слов 'company' в useFx пока нет, поэтому берём близкий по смыслу 'landing'.
useFx(root, { words: 'landing', ink: true, fade: 0 })
useScenes(root)
</script>
