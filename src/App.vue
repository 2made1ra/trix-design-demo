<template>
  <div class="flex min-h-dvh flex-col">
    <router-view class="flex-1" :key="pageKey" />
    <app-footer />
  </div>
  <Toaster position="top-center" rich-colors />
</template>

<script setup lang="ts">
import 'vue-sonner/style.css'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
// Переход по якорю внутри страницы не должен пересоздавать её.
const pageKey = computed(() => route.fullPath.split('#')[0])
</script>
