<template>
  <router-link v-if="to" :to="to" :class="classes"><slot /></router-link>
  <!-- biome-ignore lint/a11y/useAnchorContent: содержимое приходит слотом -->
  <a v-else-if="href" :href="href" :class="classes"><slot /></a>
  <button v-else :type="type ?? 'button'" :class="classes"><slot /></button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { cn } from '@/lib/utils'

const props = defineProps<{
  variant?: 'mint' | 'ink' | 'line'
  size?: 'sm'
  to?: RouteLocationRaw
  href?: string
  type?: 'button' | 'submit'
  block?: boolean
}>()

const variants = {
  mint: 'btn-mint fill-mint hover:bg-none hover:bg-mint/35 hover:text-ink hover:shadow-[0_0_0_1px_var(--mint-line)]',
  ink: 'fill-ink hover:bg-none hover:bg-quiet/20 hover:text-ink hover:shadow-[0_0_0_1px_var(--quiet)]',
  line: 'text-ink shadow-[inset_0_0_0_1px_var(--ink)] hover:bg-l-mint hover:text-black hover:shadow-[inset_0_0_0_1px_var(--l-mint)]',
}

const classes = computed(() =>
  cn(
    'inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap transition-all outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1eaedb] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    props.size === 'sm' ? 'h-9.5 px-4.5 text-sm' : 'h-11.5 px-6.5 text-[15px]',
    variants[props.variant ?? 'mint'],
    props.block && 'w-full',
  ),
)
</script>
