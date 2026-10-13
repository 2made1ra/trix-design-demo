<template>
  <org-shell header>
    <main
      class="mx-auto flex w-full max-w-360 flex-1 flex-col gap-10 px-4 pt-[clamp(32px,6vh,72px)] pb-20 sm:px-8 lg:px-16"
    >
      <slot />
    </main>
    <app-footer />
  </org-shell>
</template>

<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'
import OrgShell from '@/components/org/OrgShell.vue'
</script>
