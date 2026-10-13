<template>
  <div ref="root" class="design design-mesh calm org flex min-h-dvh flex-col">
    <org-header v-if="header" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import OrgHeader from '@/components/org/OrgHeader.vue'
import { useFx, useScenes } from '@/composables/useFx'

const props = defineProps<{ header?: boolean; rail?: boolean }>()
const root = useTemplateRef<HTMLElement>('root')

// Набора слов 'company' в useFx пока нет, поэтому берём близкий по смыслу 'landing'.
useFx(root, { words: 'landing', ink: true, fade: 0, rail: props.rail })
useScenes(root)
</script>
