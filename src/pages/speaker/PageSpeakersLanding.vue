<template>
  <sp-page :calm="false" footer="full">
    <div ref="root">
      <div class="beta k">
        <span>TRIX в закрытой бете: портфолио, подборка и разбор доклада</span>
        <router-link to="/register" class="ln">Начать</router-link>
      </div>

      <app-hero
        side="sp"
        :anchors="anchors"
        whisper="Портфолио, подборка, разбор доклада"
        headline="Найдите, где выступить."
        :lines="lines"
        lead="TRIX собирает выступления в портфолио, подбирает площадки и честно разбирает доклад:"
        lead-muted="до выступления и после."
        :cta="{ label: 'Подобрать мероприятия', to: '/register' }"
      />

      <app-ticker :items="['Портфолио', 'Подборка мероприятий', 'Разбор доклада', 'Развитие']" />

      <main class="wrap pt-24 pb-30">
        <div class="stream">
          <section id="how" class="st stream-item scroll-mt-6" aria-labelledby="how-title">
            <sp-stream-label label="Как это работает" number="01" />
            <div class="flex flex-col gap-8 pb-12">
              <h2 id="how-title" class="d-2" data-rv>Ваше флоу с TRIX</h2>
              <ol class="how" data-scene="800,1100,800,800,700,800,3600">
                <app-how-step
                  :step="1"
                  title="Внесите выступление"
                  text="Ссылка на программу, видео или пост — и выступление в портфолио за 30 секунд."
                >
                  <div class="mrow">
                    <span class="small">Ссылка</span><b class="small" data-typed="1">datafest.ru/program</b>
                  </div>
                  <div class="mrow" data-s="2">
                    <span class="small">Data Fest, Казань</span><span class="tag">14 ноября</span>
                  </div>
                </app-how-step>
                <app-how-step
                  :step="2"
                  title="Получите подборку"
                  text="Мероприятия вашей компании и открытые конференции — с объяснением, почему подходят."
                >
                  <div class="mrow" data-s="3">
                    <span class="sk w-26" /><span class="tag ink">Внутреннее</span>
                  </div>
                  <div class="mrow" data-s="4">
                    <span class="sk w-30" /><span class="tag">до 20 ноября</span>
                  </div>
                  <div class="mrow" data-s="4">
                    <span class="sk w-23" /><span class="tag mint">Оплачивается</span>
                  </div>
                </app-how-step>
                <app-how-step
                  :step="3"
                  title="Подготовьте доклад"
                  text="Загрузите текст или слайды — получите разбор под аудиторию мероприятия."
                >
                  <span class="tag dash self-start" data-s="5">slides.pdf</span>
                  <div v-for="row in reviewRows" :key="row.label" class="mrow">
                    <span class="small">{{ row.label }}</span>
                    <span class="tag" :class="row.tone" data-s="6">{{ row.status }}</span>
                  </div>
                </app-how-step>
              </ol>
            </div>
          </section>

          <app-feature
            v-for="(feature, i) in features"
            :id="feature.id"
            :key="feature.id"
            :label="feature.label"
            :number="String(i + 2).padStart(2, '0')"
            :tag="feature.badge"
            tone="mint"
            :title="feature.title"
            :text="feature.text"
            :ticks="feature.ticks"
            :flip="i % 2 === 1"
          >
            <template v-if="feature.cta" #cta>
              <router-link to="/register" class="b self-start" :class="feature.button === 'ink' ? 'b-ink' : 'b-line'">
                {{ feature.cta }}<ArrowRight />
              </router-link>
            </template>

            <figure
              v-if="feature.id === 'portfolio'"
              class="tile ink win"
              data-rv
              data-scene="700,1600,1100,1000,1000,4200"
            >
              <figcaption class="sr">Выступление по ссылке за 30 секунд и подтверждение компанией</figcaption>
              <app-win-top title="Новое выступление" note="Портфолио · 6 выступлений" />
              <div class="mrow">
                <span class="k muted">Ссылка</span><b data-typed="1">datafest.ru/kazan/program</b>
              </div>
              <app-scene-bar :step="2" busy="Читаем страницу программы" done="Карточка готова за 12 секунд" />
              <div class="mrow" data-s="3"><span class="k muted">Мероприятие</span><b>Data Fest, Казань</b></div>
              <div class="mrow" data-s="3"><span class="k muted">Тема</span><b>Feature store без боли</b></div>
              <div class="mrow" data-s="3"><span class="k muted">Дата</span><b>14 ноября</b></div>
              <div class="mrow" data-s="4">
                <span><b>Команда DevRel</b> <span class="small muted">· увидела выступление</span></span>
                <span class="stack">
                  <span class="tag dash" data-s="4-4">На подтверждении</span>
                  <span class="tag mint" data-s="5">Засчитано</span>
                </span>
              </div>
            </figure>

            <figure
              v-else-if="feature.id === 'selection'"
              class="tile mint win"
              data-rv
              data-scene="700,1500,1800,1800,4200"
            >
              <figcaption class="sr">Подборка мероприятий и предложение выступить от команды</figcaption>
              <app-win-top title="Мероприятия для вас" note="Подборка · Сохранённые" />
              <div class="picks">
                <span class="tag ink">Backend</span><span class="tag">Опытный</span
                ><span class="tag">Цель: выступать</span>
              </div>
              <app-scene-bar
                :step="1"
                busy="Подбираем мероприятия под профиль"
                done="Нашли 3 мероприятия и 1 предложение"
              />
              <div class="mrow note" data-s="2">
                <div class="cell">
                  <b>DevRel предлагает выступить</b>
                  <span class="small">Конференция о данных, трек ML · ответить до 20 ноября</span>
                </div>
                <span class="tag ink">Предложение</span>
              </div>
              <div v-for="event in demoEvents" :key="event.title" class="mrow" data-s="3">
                <div class="cell">
                  <b>{{ event.title }}</b>
                  <span class="small muted">{{ event.text }}</span>
                  <span class="k muted">{{ event.source }}</span>
                </div>
                <span class="tag" :class="event.tone">{{ event.paid }}</span>
              </div>
            </figure>

            <figure
              v-else-if="feature.id === 'review'"
              class="tile lime win"
              data-rv
              data-scene="800,900,1900,500,500,500,700,4500"
            >
              <figcaption class="sr">Разбор доклада по критериям и первая правка</figcaption>
              <app-win-top title="Миграция монолита без остановки сервиса">
                <span class="k lock"><Lock />Видите только вы</span>
              </app-win-top>
              <div class="picks">
                <span class="tag" data-s="1">slides.pdf</span
                ><span class="tag">Конференция о высоконагруженных системах</span><span class="tag">30 мин</span>
              </div>
              <app-scene-bar :step="2" busy="Разбираем доклад под аудиторию" done="Готово: 4 критерия, 2 правки" />
              <div class="flex gap-6 k muted">
                <span class="text-ink">Оценка</span><span>Правки</span><span>Вопросы из зала</span>
              </div>
              <div v-for="(row, j) in criteria" :key="row.label" class="mrow solid">
                <span>{{ row.label }}</span>
                <span class="tag" :class="row.tone" :data-s="j + 3">{{ row.status }}</span>
              </div>
              <div class="tile ink rounded-2xl px-5 py-4.5" data-s="7">
                <span class="k text-mint">Правка 01</span>
                <p class="h-20 mt-2" data-typed="7">Вынести главную мысль на второй слайд</p>
              </div>
            </figure>

            <figure
              v-else-if="feature.id === 'growth'"
              class="tile mint win"
              data-rv
              data-scene="700,1200,1200,1300,4200"
            >
              <figcaption class="sr">Оценки по критериям и оценки зала растут от первого доклада к третьему</figcaption>
              <app-win-top title="Ваш прогресс" note="3 доклада · Backend" />
              <div class="grid4 panel">
                <span aria-hidden="true" />
                <span v-for="n in 3" :key="n" class="k muted">Доклад {{ n }}</span>
                <template v-for="row in progress" :key="row.label">
                  <span>{{ row.label }}</span>
                  <span
                    v-for="(mark, j) in row.marks"
                    :key="j"
                    class="tag justify-self-start"
                    :class="marks[mark].tone"
                    :data-s="j + 1"
                  >
                    {{ marks[mark].label }}
                  </span>
                </template>
                <span>Оценки зала</span>
                <b v-for="(score, j) in ['4,1', '4,4', '4,7']" :key="score" class="num" :data-s="j + 1">{{ score }}</b>
              </div>
              <div class="mrow" data-s="4">
                <span>
                  <span class="k muted">Материал для прокачки:</span>
                  <span data-typed="4">лекция о тайминге доклада</span>
                </span>
              </div>
            </figure>

            <figure
              v-else-if="feature.id === 'first'"
              class="tile ink win"
              data-rv
              data-scene="900,1100,1300,1500,4200"
            >
              <figcaption class="sr">Площадки для первого доклада и разбор репетиции по аудио</figcaption>
              <app-win-top title="Площадки для старта" note="Backend · Казань" />
              <div class="picks">
                <span class="pick">Все</span><span class="pick" data-press="1">Первый доклад</span
                ><span class="pick">Онлайн</span>
              </div>
              <div v-for="place in places" :key="place.title" class="mrow" :data-x="place.start ? undefined : 2">
                <div class="cell">
                  <b>{{ place.title }}</b>
                  <span class="small muted">{{ place.text }}</span>
                </div>
                <span class="tag" :class="place.start && 'mint'">{{ place.start ? 'Для старта' : 'Опытным' }}</span>
              </div>
              <div class="tile mint flex items-center justify-between gap-4 rounded-2xl px-5 py-4.5" data-s="3">
                <div>
                  <span class="k">Репетиция · аудио 9:48</span>
                  <p class="h-20 mt-2">Темп речи</p>
                </div>
                <span class="tag yellow" data-s="4">Доработать</span>
              </div>
            </figure>

            <figure v-else class="tile slate win" data-rv>
              <figcaption class="sr">Кто что видит в TRIX</figcaption>
              <div class="overflow-x-auto">
                <table class="who">
                  <thead>
                    <tr>
                      <th scope="col"><span class="sr">Данные</span></th>
                      <th v-for="col in ['Вы', 'Ваша компания', 'Другие компании']" :key="col" scope="col" class="k">
                        {{ col }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in visibility" :key="row.label" :class="{ key: row.key }">
                      <th scope="row">{{ row.label }}</th>
                      <td v-for="(cell, j) in row.cells" :key="j" :class="!cell.tag && 'small'">
                        <span v-if="cell.tag" class="tag" :class="cell.tag === 'yes' ? 'mint' : 'dash'">{{
                          cell.tag === 'yes' ? 'Да' : 'Нет'
                        }}</span>
                        <template v-else>{{ cell.text }}</template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
          </app-feature>

          <app-faq :items="faq">
            Не нашли ответ — напишите нам:
            <a href="mailto:hello@trixy.space" class="ln text-ink">hello@trixy.space</a>
          </app-faq>
        </div>
      </main>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRight, Lock } from '@lucide/vue'
import { useTemplateRef } from 'vue'
import AppFaq from '@/components/AppFaq.vue'
import AppFeature from '@/components/AppFeature.vue'
import AppHero from '@/components/AppHero.vue'
import AppHowStep from '@/components/AppHowStep.vue'
import AppSceneBar from '@/components/AppSceneBar.vue'
import AppTicker from '@/components/AppTicker.vue'
import AppWinTop from '@/components/AppWinTop.vue'
import SpPage from '@/components/speaker/SpPage.vue'
import SpStreamLabel from '@/components/speaker/SpStreamLabel.vue'
import { useFx, useScenes } from '@/composables/useFx'

const root = useTemplateRef<HTMLElement>('root')
const lines = [
  'Выступайте лучше.',
  'Готовьтесь под зал.',
  'Начните с митапа.',
  'Соберите портфолио.',
  'Звучите увереннее.',
]

const anchors = [
  { label: 'Портфолио', hash: '#portfolio' },
  { label: 'Подборка', hash: '#selection' },
  { label: 'Разбор доклада', hash: '#review' },
  { label: 'Развитие', hash: '#growth' },
  { label: 'Вопросы', hash: '#faq' },
]

const reviewRows = [
  { label: 'Аудитория', status: 'Доработать', tone: 'yellow' },
  { label: 'Структура', status: 'В порядке', tone: 'mint' },
  { label: 'Тайминг', status: 'Слабо', tone: 'pink' },
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
    tone: '',
  },
  {
    title: 'Конференция о высоконагруженных системах',
    text: 'Нужен опыт выступлений — у вас 6 в портфолио. Заявки до 30 ноября',
    source: 'Подать на сайте ↗',
    paid: 'Оплата не указана',
    tone: 'dash',
  },
  {
    title: 'Открытая конференция по Go',
    text: 'Ищут доклады на 30 минут. Заявки до 5 декабря',
    source: 'Заявка через TRIX',
    paid: 'Оплачивается',
    tone: 'ink',
  },
]
const criteria = [
  { label: 'Соответствие аудитории', status: 'Доработать', tone: 'yellow' },
  { label: 'Структура', status: 'В порядке', tone: 'mint' },
  { label: 'Главная мысль', status: 'Доработать', tone: 'yellow' },
  { label: 'Укладывается во время', status: 'Слабо', tone: 'pink' },
]
const marks = {
  ok: { label: 'В порядке', tone: 'mint' },
  fix: { label: 'Доработать', tone: 'yellow' },
  weak: { label: 'Слабо', tone: 'pink' },
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
</script>
