<template>
  <sp-page>
    <div ref="root">
      <div
        class="kicker flex min-h-10 flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-[#131313] px-5 py-2 text-l-mint"
      >
        <span>TRIX в закрытой бете: портфолио, подборка и разбор доклада</span>
        <router-link to="/register" class="text-white shadow-[inset_0_-1px_0_currentColor]">Начать</router-link>
      </div>

      <section class="pt-10 pb-18">
        <app-header transparent :anchors="anchors" />
        <div class="wrap pt-16">
          <div class="mb-7 flex flex-wrap items-center gap-x-6 gap-y-2.5" data-rv>
            <nav class="sw" aria-label="Для кого TRIX">
              <router-link to="/speakers" class="pick">Спикерам</router-link>
              <router-link to="/companies" class="pick">Компаниям</router-link>
            </nav>
            <span class="text-xl leading-[1.2] font-light tracking-[1.9px]">Портфолио, подборка, разбор доклада</span>
          </div>
          <h1
            class="shout text-[clamp(56px,8.9vw,128px)] leading-[0.88]"
            data-rv
            :aria-label="`Найдите, где выступить. ${lines[0]}`"
          >
            Найдите, где выступить.
            <em
              ref="typed"
              class="block w-fit bg-[linear-gradient(90deg,#008f72,#0a7f8f_60%,#2f6fd0)] bg-clip-text text-transparent not-italic dark:bg-[linear-gradient(90deg,#3cffd0,#6fd8ff_60%,#8aa6ff)]"
              aria-hidden="true"
              >{{ typedText }}<i class="typing-caret text-[#008f72] dark:text-l-mint" /></em
            >
          </h1>
          <div class="mt-12 flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
            <p class="max-w-190 flex-[1_1_480px] font-serif text-[clamp(24px,2.2vw,32px)] leading-[1.2]" data-rv>
              TRIX собирает выступления в портфолио, подбирает площадки и честно разбирает доклад:
              <span class="text-ink-2">до выступления и после.</span>
            </p>
            <div class="flex flex-wrap gap-3" data-rv>
              <router-link to="/register" class="b b-ink">Подобрать мероприятия<ArrowRight /></router-link>
              <router-link :to="{ hash: '#how' }" class="b b-line">Как это работает</router-link>
            </div>
          </div>
        </div>
      </section>

      <div class="wrap" data-rv>
        <div
          class="ticker loud overflow-hidden rounded-[14px] bg-l-mint whitespace-nowrap text-[#131313]"
          aria-hidden="true"
        >
          <div class="ticker-track">
            <template v-for="item in ['Портфолио', 'Подборка мероприятий', 'Разбор доклада', 'Развитие']" :key="item">
              <span class="text-[22px] leading-none font-bold tracking-[-0.03em]">{{ item }}</span>
              <i class="size-2 rounded-full bg-[#008f72]" />
            </template>
          </div>
        </div>
      </div>

      <main class="wrap pt-24 pb-30">
        <div class="stream">
          <section id="how" class="stream-item scroll-mt-6" aria-labelledby="how-title">
            <sp-stream-label label="Как это работает" number="01" />
            <div class="flex flex-col gap-8 pb-12">
              <h2 id="how-title" class="shout text-d2" data-rv>Ваше флоу с TRIX</h2>
              <ol
                class="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4"
                data-scene="800,1100,800,800,700,800,3600"
              >
                <li class="tile tile-slate flex flex-col gap-7" data-rv>
                  <div class="flex min-h-43 flex-col justify-center gap-3" aria-hidden="true">
                    <div :class="mockRow">
                      <span class="text-sm">Ссылка</span>
                      <b class="text-sm" data-typed="1">datafest.ru/program</b>
                    </div>
                    <div :class="mockRow" data-s="2">
                      <span class="text-sm">Data Fest, Казань</span><span class="tag">14 ноября</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2.5">
                    <span class="kicker text-ink-2">Шаг 1</span>
                    <h3 class="text-2xl leading-[1.05] font-bold">Внесите выступление</h3>
                    <p class="text-ink-2">
                      Ссылка на программу, видео или пост — и выступление в портфолио за 30 секунд.
                    </p>
                  </div>
                </li>
                <li class="tile tile-slate flex flex-col gap-7" data-rv>
                  <div class="flex min-h-43 flex-col justify-center gap-3" aria-hidden="true">
                    <div :class="mockRow" data-s="3">
                      <span class="block h-2 w-26 rounded bg-line" />
                      <span class="tag fill-ink text-l-mint">Внутреннее</span>
                    </div>
                    <div :class="mockRow" data-s="4">
                      <span class="block h-2 w-30 rounded bg-line" /><span class="tag">до 20 ноября</span>
                    </div>
                    <div :class="mockRow" data-s="4">
                      <span class="block h-2 w-23 rounded bg-line" /><span class="tag fill-mint">Оплачивается</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2.5">
                    <span class="kicker text-ink-2">Шаг 2</span>
                    <h3 class="text-2xl leading-[1.05] font-bold">Получите подборку</h3>
                    <p class="text-ink-2">
                      Мероприятия вашей компании и открытые конференции — с объяснением, почему подходят.
                    </p>
                  </div>
                </li>
                <li class="tile tile-slate flex flex-col gap-7" data-rv>
                  <div class="flex min-h-43 flex-col justify-center gap-3" aria-hidden="true">
                    <span class="tag tag-dash self-start" data-s="5">slides.pdf</span>
                    <div v-for="row in reviewRows" :key="row.label" :class="mockRow">
                      <span class="text-sm">{{ row.label }}</span>
                      <span class="tag" :class="row.fill" data-s="6">{{ row.status }}</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2.5">
                    <span class="kicker text-ink-2">Шаг 3</span>
                    <h3 class="text-2xl leading-[1.05] font-bold">Подготовьте доклад</h3>
                    <p class="text-ink-2">Загрузите текст или слайды — получите разбор под аудиторию мероприятия.</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section
            v-for="(feature, i) in features"
            :id="feature.id"
            :key="feature.id"
            class="stream-item scroll-mt-6"
            :aria-labelledby="`${feature.id}-title`"
          >
            <sp-stream-label :label="feature.label" :number="String(i + 2).padStart(2, '0')" />
            <div class="flex flex-wrap items-center gap-x-12 gap-y-8 pb-12" :class="{ 'flex-row-reverse': i % 2 }">
              <div class="flex min-w-0 flex-[1_1_380px] flex-col gap-5" data-rv>
                <span class="tag self-start fill-mint">{{ feature.badge }}</span>
                <h2 :id="`${feature.id}-title`" class="shout text-d3">{{ feature.title }}</h2>
                <p class="text-[17px] leading-[1.55] text-ink-2">{{ feature.text }}</p>
                <ul class="ticks text-sm">
                  <li v-for="tick in feature.ticks" :key="tick">{{ tick }}</li>
                </ul>
                <router-link
                  v-if="feature.cta"
                  to="/register"
                  class="b self-start"
                  :class="feature.button === 'ink' ? 'b-ink' : 'b-line'"
                >
                  {{ feature.cta }}<ArrowRight />
                </router-link>
              </div>

              <figure
                v-if="feature.id === 'portfolio'"
                class="tile surface-ink sp-win min-w-0 flex-[999_1_560px]"
                data-rv
                data-scene="700,1600,1100,1000,1000,4200"
              >
                <figcaption class="sr-only">Выступление по ссылке за 30 секунд и подтверждение компанией</figcaption>
                <sp-window-top title="Новое выступление" note="Портфолио · 6 выступлений" />
                <div class="sp-mrow">
                  <span class="kicker text-ink-2">Ссылка</span><b data-typed="1">datafest.ru/kazan/program</b>
                </div>
                <sp-scene-bar :step="2" busy="Читаем страницу программы" done="Карточка готова за 12 секунд" />
                <div class="sp-mrow" data-s="3">
                  <span class="kicker text-ink-2">Мероприятие</span><b>Data Fest, Казань</b>
                </div>
                <div class="sp-mrow" data-s="3">
                  <span class="kicker text-ink-2">Тема</span><b>Feature store без боли</b>
                </div>
                <div class="sp-mrow" data-s="3"><span class="kicker text-ink-2">Дата</span><b>14 ноября</b></div>
                <div class="sp-mrow" data-s="4">
                  <span><b>Команда DevRel</b> <span class="text-sm text-ink-2">· увидела выступление</span></span>
                  <span class="grid items-center justify-items-end *:col-start-1 *:row-start-1">
                    <span class="tag tag-dash" data-s="4-4">На подтверждении</span>
                    <span class="tag fill-mint" data-s="5">Засчитано</span>
                  </span>
                </div>
              </figure>

              <figure
                v-else-if="feature.id === 'selection'"
                class="tile surface-mint sp-win min-w-0 flex-[999_1_560px]"
                data-rv
                data-scene="700,1500,1800,1800,4200"
              >
                <figcaption class="sr-only">Подборка мероприятий и предложение выступить от команды</figcaption>
                <sp-window-top title="Мероприятия для вас" note="Подборка · Сохранённые" />
                <div class="flex flex-wrap gap-2">
                  <span class="tag fill-ink text-l-mint">Backend</span>
                  <span class="tag">Опытный</span>
                  <span class="tag">Цель: выступать</span>
                </div>
                <sp-scene-bar
                  :step="1"
                  busy="Подбираем мероприятия под профиль"
                  done="Нашли 3 мероприятия и 1 предложение"
                />
                <div class="sp-mrow" data-s="2">
                  <div class="flex flex-col gap-1">
                    <b>DevRel предлагает выступить</b>
                    <span class="text-sm">Конференция о данных, трек ML · ответить до 20 ноября</span>
                  </div>
                  <span class="tag fill-ink text-l-mint">Предложение</span>
                </div>
                <div v-for="event in demoEvents" :key="event.title" class="sp-mrow" data-s="3">
                  <div class="flex flex-col gap-1">
                    <b>{{ event.title }}</b>
                    <span class="text-sm text-ink-2">{{ event.text }}</span>
                    <span class="kicker text-ink-2">{{ event.source }}</span>
                  </div>
                  <span class="tag" :class="event.fill">{{ event.paid }}</span>
                </div>
              </figure>

              <figure
                v-else-if="feature.id === 'review'"
                class="tile surface-lime sp-win min-w-0 flex-[999_1_560px]"
                data-rv
                data-scene="800,900,1900,500,500,500,700,4500"
              >
                <figcaption class="sr-only">Разбор доклада по критериям и первая правка</figcaption>
                <sp-window-top title="Миграция монолита без остановки сервиса">
                  <span class="kicker flex items-center gap-1.5"><Lock class="size-3.5" />Видите только вы</span>
                </sp-window-top>
                <div class="flex flex-wrap gap-2">
                  <span class="tag" data-s="1">slides.pdf</span>
                  <span class="tag">Конференция о высоконагруженных системах</span>
                  <span class="tag">30 мин</span>
                </div>
                <sp-scene-bar :step="2" busy="Разбираем доклад под аудиторию" done="Готово: 4 критерия, 2 правки" />
                <div v-for="(row, j) in criteria" :key="row.label" class="sp-mrow solid">
                  <span>{{ row.label }}</span>
                  <span class="tag" :class="row.fill" :data-s="j + 3">{{ row.status }}</span>
                </div>
                <div class="tile surface-ink rounded-2xl px-5 py-4.5" data-s="7">
                  <span class="kicker text-l-mint">Правка 01</span>
                  <p class="mt-2 text-xl leading-[1.1] font-bold" data-typed="7">
                    Вынести главную мысль на второй слайд
                  </p>
                </div>
              </figure>

              <figure
                v-else-if="feature.id === 'growth'"
                class="tile surface-mint sp-win min-w-0 flex-[999_1_560px]"
                data-rv
                data-scene="700,1200,1200,1300,4200"
              >
                <figcaption class="sr-only">
                  Оценки по критериям и оценки зала растут от первого доклада к третьему
                </figcaption>
                <sp-window-top title="Ваш прогресс" note="3 доклада · Backend" />
                <div
                  class="grid grid-cols-[minmax(110px,1.2fr)_repeat(3,minmax(0,1fr))] items-center gap-2 rounded-[14px] bg-paper p-4"
                >
                  <span aria-hidden="true" />
                  <span v-for="n in 3" :key="n" class="kicker text-ink-2">Доклад {{ n }}</span>
                  <template v-for="row in progress" :key="row.label">
                    <span>{{ row.label }}</span>
                    <span
                      v-for="(mark, j) in row.marks"
                      :key="j"
                      class="tag justify-self-start"
                      :class="marks[mark].fill"
                      :data-s="j + 1"
                    >
                      {{ marks[mark].label }}
                    </span>
                  </template>
                  <span>Оценки зала</span>
                  <b v-for="(score, j) in ['4,1', '4,4', '4,7']" :key="score" :data-s="j + 1">{{ score }}</b>
                </div>
                <div class="sp-mrow" data-s="4">
                  <span>
                    <span class="kicker text-ink-2">Материал для прокачки: </span>
                    <span data-typed="4">лекция о тайминге доклада</span>
                  </span>
                </div>
              </figure>

              <figure
                v-else-if="feature.id === 'first'"
                class="tile surface-ink sp-win min-w-0 flex-[999_1_560px]"
                data-rv
                data-scene="900,1100,1300,1500,4200"
              >
                <figcaption class="sr-only">Площадки для первого доклада и разбор репетиции по аудио</figcaption>
                <sp-window-top title="Площадки для старта" note="Backend · Казань" />
                <div class="flex flex-wrap gap-2">
                  <span class="pick">Все</span>
                  <span class="pick" data-press="1">Первый доклад</span>
                  <span class="pick">Онлайн</span>
                </div>
                <div v-for="place in places" :key="place.title" class="sp-mrow" :data-x="place.start ? undefined : 2">
                  <div class="flex flex-col gap-1">
                    <b>{{ place.title }}</b>
                    <span class="text-sm text-ink-2">{{ place.text }}</span>
                  </div>
                  <span class="tag" :class="place.start && 'fill-mint'">{{
                    place.start ? 'Для старта' : 'Опытным'
                  }}</span>
                </div>
                <div
                  class="tile surface-mint flex items-center justify-between gap-4 rounded-2xl px-5 py-4.5"
                  data-s="3"
                >
                  <div>
                    <span class="kicker">Репетиция · аудио 9:48</span>
                    <p class="mt-2 text-xl leading-[1.1] font-bold">Темп речи</p>
                  </div>
                  <span class="tag fill-yellow" data-s="4">Доработать</span>
                </div>
              </figure>

              <figure v-else class="tile tile-slate sp-win min-w-0 flex-[999_1_560px]" data-rv>
                <figcaption class="sr-only">Кто что видит в TRIX</figcaption>
                <table class="who">
                  <thead>
                    <tr>
                      <th scope="col"><span class="sr-only">Данные</span></th>
                      <th
                        v-for="col in ['Вы', 'Ваша компания', 'Другие компании']"
                        :key="col"
                        scope="col"
                        class="kicker"
                      >
                        {{ col }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in visibility" :key="row.label" :class="{ key: row.key }">
                      <th scope="row">{{ row.label }}</th>
                      <td v-for="(cell, j) in row.cells" :key="j" :class="!cell.tag && 'text-sm'">
                        <span v-if="cell.tag" class="tag" :class="cell.tag === 'yes' ? 'fill-mint' : 'tag-dash'">{{
                          cell.tag === 'yes' ? 'Да' : 'Нет'
                        }}</span>
                        <template v-else>{{ cell.text }}</template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </figure>
            </div>
          </section>

          <section id="faq" class="stream-item scroll-mt-6" aria-labelledby="faq-title">
            <sp-stream-label label="Вопросы" number="08" />
            <div class="flex flex-wrap items-start gap-12" data-rv>
              <div class="faq min-w-0 flex-[999_1_560px]">
                <details v-for="(item, i) in faq" :key="item.question" :open="i === 0">
                  <summary>
                    <span class="text-2xl leading-[1.05] font-bold">{{ item.question }}</span><i aria-hidden="true" />
                  </summary>
                  <p class="text-ink-2">{{ item.answer }}</p>
                </details>
              </div>
              <div class="flex min-w-0 flex-[1_1_340px] flex-col gap-4">
                <h2 id="faq-title" class="shout text-d3">Остались вопросы?</h2>
                <p class="text-[17px] leading-[1.55] text-ink-2">
                  Не нашли ответ — напишите нам:
                  <a href="mailto:hello@trixy.space" class="ln text-ink">hello@trixy.space</a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <section class="wrap pb-12" aria-labelledby="start-title">
        <div class="tile surface-mint flex flex-wrap items-center justify-between gap-x-12 gap-y-6 p-10" data-rv>
          <div class="flex flex-col gap-3">
            <span class="kicker">Начать</span>
            <h2 id="start-title" class="shout text-d3">Начните с одного выступления</h2>
          </div>
          <router-link to="/register" class="b b-ink">Подобрать мероприятия<ArrowRight /></router-link>
        </div>
      </section>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRight, Lock } from '@lucide/vue'
import { ref, useTemplateRef } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import SpPage from '@/components/speaker/SpPage.vue'
import SpSceneBar from '@/components/speaker/SpSceneBar.vue'
import SpStreamLabel from '@/components/speaker/SpStreamLabel.vue'
import SpWindowTop from '@/components/speaker/SpWindowTop.vue'
import { useFx, useScenes, useTyping } from '@/composables/useFx'

const root = useTemplateRef<HTMLElement>('root')
const typed = useTemplateRef<HTMLElement>('typed')
const lines = [
  'Выступайте лучше.',
  'Готовьтесь под зал.',
  'Начните с митапа.',
  'Соберите портфолио.',
  'Звучите увереннее.',
]
const typedText = ref(lines[0])

const anchors = [
  { label: 'Портфолио', to: { hash: '#portfolio' } },
  { label: 'Подборка', to: { hash: '#selection' } },
  { label: 'Разбор доклада', to: { hash: '#review' } },
  { label: 'Развитие', to: { hash: '#growth' } },
  { label: 'Вопросы', to: { hash: '#faq' } },
]

const mockRow =
  'flex items-center justify-between gap-3 rounded-[14px] bg-paper px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--line-2)]'

const reviewRows = [
  { label: 'Аудитория', status: 'Доработать', fill: 'fill-yellow' },
  { label: 'Структура', status: 'В порядке', fill: 'fill-mint' },
  { label: 'Тайминг', status: 'Слабо', fill: 'fill-pink' },
]

const features = [
  {
    id: 'portfolio',
    label: 'Портфолио',
    badge: 'Портфолио',
    title: 'Выступление за 30 секунд',
    text: 'Вставьте ссылку на программу, видео или пост — TRIX сам заполнит карточку: мероприятие, дату и тему. Компания увидит выступление без ваших отчётов и засчитает его.',
    ticks: [
      'Внутренние и внешние выступления в одном месте',
      'Подтверждённые выступления идут в зачёт',
      'Портфолио ваше: оно остаётся с вами, даже если вы смените работу',
    ],
    cta: 'Собрать портфолио',
    button: 'ink',
  },
  {
    id: 'selection',
    label: 'Подборка',
    badge: 'Подборка мероприятий',
    title: 'Мероприятия под ваш профиль',
    text: 'Внутренние мероприятия вашей компании и открытые конференции с приёмом докладов. Подбираем по сфере, уровню и цели и объясняем, почему подходит.',
    ticks: [
      'Почему подходит — в каждой карточке',
      'Дедлайн заявки и метка оплаты, если организатор её указал',
      '«Заявка через TRIX» подаётся здесь, остальные — на сайте организатора',
    ],
    cta: 'Подобрать мероприятия',
    button: 'ink',
  },
  {
    id: 'review',
    label: 'Разбор',
    badge: 'Разбор доклада',
    title: 'Разбор доклада под аудиторию',
    text: 'Загрузите текст или слайды и выберите мероприятие. TRIX оценит доклад по понятным критериям и расставит правки по приоритету. Разбор видите только вы — даже ваша команда его не видит.',
    ticks: [
      'Оценка по критериям: аудитория, структура, главная мысль, тайминг',
      'Правки по приоритету со ссылками на слайды',
      'Вопросы, которые вероятно зададут из зала',
    ],
    cta: 'Посмотреть пример разбора',
    button: 'line',
  },
  {
    id: 'growth',
    label: 'Развитие',
    badge: 'Развитие',
    title: 'Прогресс от доклада к докладу',
    text: 'После выступления загрузите запись — TRIX разберёт её с таймкодами. QR-код на последнем слайде соберёт оценки зала. Вы увидите, что стало лучше, и получите материалы под слабые места.',
    ticks: [
      'Разбор после выступления по записи, с таймкодами',
      'Оценки зала через QR-анкету: анонимно и без регистрации',
      'Материалы под критерии, которые пока проседают',
    ],
    cta: 'Как устроено развитие',
    button: 'line',
  },
  {
    id: 'first',
    label: 'Первый доклад',
    badge: 'Первый доклад',
    title: 'Если ещё не выступали',
    text: 'Отметьте в профиле «ещё не выступал» — TRIX предложит площадки для старта. Например, внутренние митапы вашей компании, где доклад можно обкатать в знакомом зале.',
    ticks: [
      'Внутренние митапы и короткие слоты для первого доклада',
      'Разбор репетиции по аудиозаписи, пока есть время поправить',
      'Материалы под слабые места до выступления',
    ],
    cta: 'Начать с первого доклада',
    button: 'ink',
  },
  {
    id: 'privacy',
    label: 'Приватность',
    badge: 'Приватность',
    title: 'Кто что видит',
    text: 'Разбор доклада видите только вы: ни ваша команда, ни организаторы его не видят. Компания видит ваши выступления и оценки зала, а другие компании — только то, что вы откроете сами.',
    ticks: [
      'Черновики и разборы остаются вашими',
      'Профиль для других компаний — только по вашему согласию',
      'Портфолио остаётся с вами, если вы смените работу',
    ],
    cta: '',
    button: 'ink',
  },
] as const

const demoEvents = [
  {
    title: 'Внутренний митап Go-разработчиков',
    text: 'Ваша тема совпадает с треком «Производительность». Заявки до 25 ноября',
    source: 'Внутреннее · Заявка через TRIX',
    paid: 'Не оплачивается',
    fill: '',
  },
  {
    title: 'Конференция о высоконагруженных системах',
    text: 'Нужен опыт выступлений — у вас 6 в портфолио. Заявки до 30 ноября',
    source: 'Подать на сайте ↗',
    paid: 'Оплата не указана',
    fill: 'tag-dash',
  },
  {
    title: 'Открытая конференция по Go',
    text: 'Ищут доклады на 30 минут. Заявки до 5 декабря',
    source: 'Заявка через TRIX',
    paid: 'Оплачивается',
    fill: 'fill-ink text-l-mint',
  },
]
const criteria = [
  { label: 'Соответствие аудитории', status: 'Доработать', fill: 'fill-yellow' },
  { label: 'Структура', status: 'В порядке', fill: 'fill-mint' },
  { label: 'Главная мысль', status: 'Доработать', fill: 'fill-yellow' },
  { label: 'Укладывается во время', status: 'Слабо', fill: 'fill-pink' },
]
const marks = {
  ok: { label: 'В порядке', fill: 'fill-mint' },
  fix: { label: 'Доработать', fill: 'fill-yellow' },
  weak: { label: 'Слабо', fill: 'fill-pink' },
} as const
const progress: { label: string; marks: (keyof typeof marks)[] }[] = [
  { label: 'Структура', marks: ['fix', 'ok', 'ok'] },
  { label: 'Главная мысль', marks: ['weak', 'fix', 'ok'] },
  { label: 'Тайминг', marks: ['weak', 'weak', 'fix'] },
]
const places = [
  { title: 'Внутренний митап бэкенда', text: 'Доклады на 10 минут, опыт не нужен', start: true },
  { title: 'Конференция о высоконагруженных системах', text: 'Отбор по заявкам, нужен опыт выступлений', start: false },
  { title: 'Онлайн-митап команды платформы', text: 'Слот 15 минут и разбор после выступления', start: true },
]

type Cell = { tag: 'yes' | 'no' } | { tag?: undefined; text: string }
const yes: Cell = { tag: 'yes' }
const no: Cell = { tag: 'no' }
const visibility: { label: string; key?: boolean; cells: Cell[] }[] = [
  { label: 'Портфолио выступлений', cells: [yes, yes, { text: 'При открытом профиле' }] },
  { label: 'Оценки зала', cells: [yes, yes, no] },
  { label: 'Разбор доклада и аннотации', key: true, cells: [yes, no, no] },
  { label: 'Рейтинг в компании', cells: [{ text: 'Своё место' }, { text: 'Весь' }, no] },
  { label: 'Заявки', cells: [{ text: 'Свои' }, { text: 'На её мероприятия' }, { text: 'На их мероприятия' }] },
]

const faq = [
  {
    question: 'Откуда берутся мероприятия?',
    answer:
      'Прежде всего — мероприятия вашей компании: внутренние митапы и конференции, которые ведёт ваша команда. Плюс открытые конференции с приёмом докладов. С меткой «Заявка через TRIX» заявку подаёте здесь, на остальные — на сайте организатора. Оплату отмечаем, только если организатор её указал.',
  },
  {
    question: 'Кто видит мой разбор?',
    answer:
      'Только вы. Ни ваша команда, ни организаторы его не видят. В рейтинг идут подтверждённые выступления и рост оценок зала, а не оценки из разбора.',
  },
  {
    question: 'Что видит моя компания?',
    answer:
      'Выступления, которые вы внесли, и оценки зала. Команда видит их, только когда вы приняли приглашение: это ваше согласие.',
  },
  {
    question: 'Что будет с портфолио, если я уйду из компании?',
    answer: 'Портфолио останется у вас. Компания сохранит выступления, сделанные от её имени, но новых уже не увидит.',
  },
  {
    question: 'Какие материалы можно загрузить?',
    answer: 'До выступления — текст, слайды в PDF или аудио репетиции. После — запись выступления.',
  },
  {
    question: 'Подойдёт ли TRIX, если я ещё не выступал?',
    answer:
      'Да. Отметьте в профиле «ещё не выступал» — подберём площадки для старта и поможем подготовиться к первому докладу.',
  },
  {
    question: 'Сколько стоит TRIX?',
    answer: 'Пока TRIX в закрытой бете, все возможности бесплатны.',
  },
]

useFx(root, { words: 'home', ink: true, fade: 0, rate: 260 })
useScenes(root)
useTyping(typed, lines, (text) => {
  typedText.value = text
})
</script>
