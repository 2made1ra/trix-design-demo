<template>
  <org-onboarding-frame :step="step" :title="meta.title" :description="meta.description" :hint="meta.hint">
    <org-step-profile v-if="step === 1" />
    <org-step-team v-else-if="step === 2" />
    <org-step-speakers v-else ref="speakers" />

    <template #links>
      <span>© 2026 TRIX</span>
      <button v-if="step === 3" type="button" :class="linkClass" @click="speakers?.skip()">Продолжить позже</button>
    </template>
  </org-onboarding-frame>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { linkClass } from '@/components/org/classes'
import OrgOnboardingFrame from '@/components/org/OrgOnboardingFrame.vue'
import OrgStepProfile from '@/components/org/OrgStepProfile.vue'
import OrgStepSpeakers from '@/components/org/OrgStepSpeakers.vue'
import OrgStepTeam from '@/components/org/OrgStepTeam.vue'

const metas = {
  1: {
    title: 'Расскажите об организации',
    description: 'Шаг обязательный: без него кабинет не откроется. Пара минут, всё можно поменять позже.',
    hint: 'Название, направления, города и домены нужны, чтобы подбирать спикеров и мероприятия под вашу организацию.',
  },
  2: {
    title: 'Позовите коллег',
    description:
      'Команда видит спикеров, их выступления и оценки зала. Разборы докладов спикеров команда не видит. Шаг можно пропустить.',
    hint: 'Коллеги из DevRel, HR-бренда и сообществ работают в кабинете вместе с вами: ведут спикеров и мероприятия.',
  },
  3: {
    title: 'Пригласите спикеров',
    description:
      'Загрузите таблицу в любом виде — модель разберёт колонки и прошлые выступления, вы проверите и разошлёте приглашения',
    hint: 'Таблица со спикерами: модель разберёт колонки, вы проверите превью, и мы разошлём приглашения.',
  },
} as const

const route = useRoute()
const speakers = useTemplateRef<InstanceType<typeof OrgStepSpeakers>>('speakers')
const step = computed(() => Math.min(3, Math.max(1, Number(route.params.step))) as 1 | 2 | 3)
const meta = computed(() => metas[step.value])
</script>
