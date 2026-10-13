<template>
  <org-shell>
    <div class="grid flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside
        class="glow-block @container m-4 flex min-h-130 flex-col justify-between gap-10 p-6 sm:p-10 lg:mr-0"
        data-rv
      >
        <router-link :to="{ name: 'companies.landing' }" class="brand self-start text-ink hover:text-ink"
          >TRIX</router-link
        >
        <div
          class="flex max-w-95 animate-[bob_7s_ease-in-out_infinite] flex-col gap-4 rounded-[18px] bg-paper/90 p-7 shadow-[0_1px_2px_rgb(0_0_0/4%),0_24px_48px_-24px_rgb(0_0_0/28%)] backdrop-blur-lg motion-reduce:animate-none"
        >
          <slot name="card" />
        </div>
        <span
          class="hidden text-[38cqi] leading-[0.74] font-bold tracking-[-0.05em] whitespace-nowrap text-ink/90 lg:block"
          aria-hidden="true"
        >
          <slot name="big" />
        </span>
      </aside>

      <main class="flex max-w-215 min-w-0 flex-col gap-10 px-4 pt-[clamp(40px,8vh,120px)] pb-14 sm:px-10 xl:px-24">
        <slot />
      </main>
    </div>
    <slot name="footer" />
  </org-shell>
</template>

<script setup lang="ts">
import OrgShell from '@/components/org/OrgShell.vue'
</script>
