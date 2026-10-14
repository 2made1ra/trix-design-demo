<template>
  <app-onboarding-frame
    side="co"
    :home="{ name: 'companies.landing' }"
    :big="`0${step}`"
    sub="/03"
    tall
    :footer="false"
  >
    <template #float>
      <span class="k muted">Шаг {{ step }} из 3</span>
      <app-progress :current="step" label="Онбординг организации" />
      <p class="small muted">{{ meta.hint }}</p>
    </template>

    <div class="head" data-rv>
      <app-tag tone="lime" class="self-start">Онбординг организации</app-tag>
      <h1 class="d-1">{{ meta.title }}</h1>
      <p class="deck text-[20px]">{{ meta.description }}</p>
    </div>
    <org-step-profile v-if="step === 1" />
    <org-step-team v-else-if="step === 2" />
    <org-step-speakers v-else ref="speakers" />

    <template #footer>
      <footer class="obl">
        <ol aria-label="Шаги онбординга">
          <li
            v-for="(name, i) in ['Организация', 'Команда', 'Спикеры']"
            :key="name"
            :class="i + 1 < step ? 'done' : i + 1 === step ? 'on' : ''"
            :aria-current="i + 1 === step ? 'step' : undefined"
          >
            <span class="k">0{{ i + 1 }}<CheckIcon v-if="i + 1 < step" /></span>
            <b>{{ name }}</b>
          </li>
        </ol>
        <div class="k muted obl-r">
          <span>© 2026 TRIX</span>
          <a href="#help" class="ln">Помощь</a>
          <button v-if="step === 3" type="button" class="ln" @click="speakers?.skip()">Продолжить позже</button>
        </div>
      </footer>
    </template>
  </app-onboarding-frame>
</template>

<script setup lang="ts">
import { CheckIcon } from '@lucide/vue'
import { computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import AppOnboardingFrame from '@/components/AppOnboardingFrame.vue'
import AppProgress from '@/components/AppProgress.vue'
import AppTag from '@/components/AppTag.vue'
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
