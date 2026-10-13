<template>
  <footer class="px-6 py-6 text-sm text-neutral-500">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
      <span>© 2026 TRIX</span>
      <button type="button" class="underline-offset-4 hover:underline" :disabled="busy" @click="resetDemoState">
        Сбросить демо
      </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { resetDemo } from '@/api/demo'
import { useAuth } from '@/composables/useAuth'

const { logout } = useAuth()
const busy = ref(false)

// Полная перезагрузка вместо router.push: так не остаётся состояния страниц от прошлого прогона демо.
const resetDemoState = async () => {
  busy.value = true
  await resetDemo()
  logout()
  window.location.assign('/')
}
</script>
