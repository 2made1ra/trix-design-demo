<template>
  <sp-page :calm="false" side="co" footer="full">
    <div ref="root">
      <div class="beta k">
        <span>TRIX в закрытой бете: подключаем первые организации</span>
        <router-link :to="{ name: 'connect' }" class="ln">Оставить заявку</router-link>
      </div>

      <app-hero
        side="co"
        :anchors="anchors"
        whisper="Спикеры, выступления, оценки зала"
        headline="Все ваши спикеры."
        :lines="lines"
        lead="Эксперты сами вносят выступления за 30 секунд, а команда видит,"
        lead-muted="кто, где и как выступил и кого позвать дальше."
        :cta="{ label: 'Подключить организацию', to: { name: 'connect' } }"
      />

      <app-ticker :items="['Спикеры', 'Новые выступления', 'Кого позвать', 'Дашборд']" />

      <main class="wrap pt-24 pb-30">
        <div class="stream">
          <section id="how" class="st stream-item scroll-mt-6" aria-labelledby="how-title">
            <sp-stream-label label="Как это работает" number="01" />
            <div class="flex flex-col gap-8 pb-12">
              <h2 id="how-title" class="d-2" data-rv>Ваше флоу с TRIX</h2>
              <ol class="how" data-scene="800,1100,700,1000,1100,700,600,600,3600">
                <app-how-step
                  :step="1"
                  title="Подключитесь и позовите спикеров"
                  text="Заявка с рабочей почтой и проверка домена. Спикеров зовёте ссылкой или файлом Excel любого вида."
                >
                  <div class="mrow">
                    <span class="small">Рабочая почта</span><b class="small" data-typed="1">devrel@company.ru</b>
                  </div>
                  <app-tag tone="mint" class="self-start" data-s="2">Домен совпал</app-tag>
                  <div class="mrow" data-s="3">
                    <span class="small">212 спикеров</span><app-tag tone="ink">Приглашены</app-tag>
                  </div>
                </app-how-step>
                <app-how-step
                  :step="2"
                  title="Спикеры вносят выступления"
                  text="За 30 секунд по ссылке на программу, видео или пост. Взамен — подборка площадок и разбор доклада."
                >
                  <div class="mrow">
                    <span class="small">Ссылка</span><b class="small" data-typed="4">datafest.ru/program</b>
                  </div>
                  <div class="mrow" data-s="5">
                    <span class="small">Новое выступление</span><app-tag tone="lime">Анна К.</app-tag>
                  </div>
                </app-how-step>
                <app-how-step
                  :step="3"
                  title="Видите всех и зовёте нужных"
                  text="Выступления, оценки зала и темы в одном окне. Под мероприятие TRIX предложит своих спикеров."
                >
                  <app-picks>
                    <app-pick data-press="6">Data Science</app-pick><app-pick data-press="7">NPS от 9.4</app-pick>
                  </app-picks>
                  <div class="mrow" data-s="8">
                    <span class="small">Нашли спикеров</span><b class="num">8</b>
                  </div>
                </app-how-step>
              </ol>
            </div>
          </section>

          <app-feature
            id="speakers"
            label="Спикеры"
            number="02"
            tag="Спикеры"
            tone="lime"
            title="Все эксперты в одном окне"
            text="Фильтруйте по направлению, городу, NPS, числу выступлений и уровню. Найти «NPS выше 9.4, Data Science, не Москва» — один запрос, а не неделя переписки."
            :ticks="[
              'Таблица спикеров с группировкой по городам',
              'Карточка спикера: выступления, темы, оценки зала',
              'Пока спикер не принял приглашение, видны данные из вашей таблицы',
            ]"
          >
            <template #cta>
              <app-button :to="{ name: 'connect' }" variant="ink" class="self-start">
                Подключить организацию<ArrowRight />
              </app-button>
            </template>
            <app-tile as="figure" tone="ink" class="win" data-rv data-scene="700,1000,1200,4200">
              <figcaption class="sr">База спикеров с фильтром по направлению, NPS и городу</figcaption>
              <app-win-top title="Спикеры" note="212 · 14 городов" />
              <app-picks>
                <app-tag tone="mint" data-s="1">Data Science</app-tag
                ><app-tag tone="mint" data-s="1">NPS от 9.4</app-tag><app-tag tone="mint" data-s="1">Не Москва</app-tag
                ><app-tag>Конференции</app-tag>
              </app-picks>
              <app-scene-bar :step="1" busy="Фильтруем 212 спикеров" done="Нашли 8 спикеров" />
              <div v-for="person in people" :key="person.name" class="mrow" :data-s="person.invited ? 3 : 2">
                <div class="person">
                  <span class="ava" :class="person.tone">{{ person.initials }}</span>
                  <div class="cell">
                    <b>{{ person.name }}</b>
                    <span class="small muted">{{ person.text }}</span>
                  </div>
                </div>
                <div class="end">
                  <span class="num">{{ person.nps }}</span>
                  <app-tag v-if="person.tag" :tone="person.invited ? 'dash' : 'mint'">{{ person.tag }}</app-tag>
                </div>
              </div>
            </app-tile>
          </app-feature>

          <app-feature
            id="talks"
            label="Выступления"
            number="03"
            tag="Новые выступления"
            tone="lime"
            title="Выступления без отчётов"
            text="Спикеры вносят выступления сами, даже те, о которых вы не знали. Раз в неделю команда подтверждает их, ставит оценку и отмечает лучших."
            :ticks="[
              'Ссылка на программу, видео или пост вместо отчёта',
              'Подтверждённое выступление засчитывается спикеру',
              '«Рекомендую» — сигнал, кого звать на большие сцены',
            ]"
            flip
          >
            <app-tile as="figure" tone="lime" class="win" data-rv data-scene="700,1000,900,1100,4200">
              <figcaption class="sr">Команда подтверждает новые выступления и отмечает «Рекомендую»</figcaption>
              <app-win-top title="Новые выступления" note="Неделя · 5 новых" />
              <div class="mrow">
                <div class="cell">
                  <b>Анна Ковалёва — «Feature store без боли»</b>
                  <span class="small muted">Data Fest, Казань · программа по ссылке</span>
                </div>
                <span class="stack">
                  <app-button as="span" variant="ink" sm aria-hidden="true" data-s="0-1" data-press="1"
                    >Подтвердить</app-button
                  >
                  <app-tag tone="ink" data-s="2">Засчитано</app-tag>
                </span>
              </div>
              <div class="mrow">
                <div class="cell">
                  <b>Илья Морозов — «LLM в проде: что сломалось»</b>
                  <span class="small muted">Подкаст · запись выступления</span>
                </div>
                <span class="stack">
                  <app-tag tone="dash" data-s="0-2">Ждёт подтверждения</app-tag>
                  <app-tag tone="ink" data-s="3">Рекомендую</app-tag>
                </span>
              </div>
              <div class="mrow">
                <div class="cell">
                  <b>Ольга Смирнова — «A/B-тесты без мифов»</b>
                  <span class="small muted">Внутренний митап · пост в канале</span>
                </div>
                <app-tag tone="dash">Ждёт подтверждения</app-tag>
              </div>
            </app-tile>
          </app-feature>

          <app-feature
            id="invite"
            label="Кого позвать"
            number="04"
            tag="Кого позвать"
            tone="lime"
            title="Кого позвать — за минуту"
            text="Откройте мероприятие и нажмите «Кого позвать»: TRIX предложит ваших спикеров по теме, NPS и уровню и объяснит выбор. Решение и приглашение — за вами."
            :ticks="[
              'Причины словами: тема, оценки зала, опыт',
              'Предложение выступить приходит спикеру в TRIX',
              'Видно, кто согласился, а кто отказался',
            ]"
          >
            <app-tile as="figure" tone="mint" class="win" data-rv data-scene="700,1500,900,1000,4200">
              <figcaption class="sr">Подбор своих спикеров под конференцию и предложение выступить</figcaption>
              <app-win-top title="Конференция о данных" note="Трек ML · заявки до 20 ноября" />
              <app-button as="span" variant="ink" sm class="self-start" aria-hidden="true" data-press="1"
                >Кого позвать</app-button
              >
              <app-scene-bar :step="1" busy="Подбираем спикеров под трек" done="Нашли 3 подходящих" />
              <div class="mrow" data-s="2">
                <div class="cell">
                  <b>Анна Ковалёва</b>
                  <span class="small muted">Тема совпадает с треком, NPS 9.7 на последних выступлениях</span>
                </div>
                <span class="stack">
                  <app-button as="span" variant="line" sm aria-hidden="true" data-s="2-2">Предложить</app-button>
                  <app-tag data-s="3-3">Предложено</app-tag>
                  <app-tag tone="ink" data-s="4">Согласна</app-tag>
                </span>
              </div>
              <div class="mrow" data-s="2">
                <div class="cell">
                  <b>Илья Морозов</b>
                  <span class="small muted">Выступал на этой конференции в прошлом году, NPS 9.5</span>
                </div>
                <app-button as="span" variant="line" sm aria-hidden="true">Предложить</app-button>
              </div>
              <div class="mrow" data-s="2">
                <div class="cell">
                  <b>Дмитрий Романов</b>
                  <span class="small muted">Сильная тема по MLOps, первая большая сцена</span>
                </div>
                <app-button as="span" variant="line" sm aria-hidden="true">Предложить</app-button>
              </div>
            </app-tile>
          </app-feature>

          <app-feature
            id="events"
            label="Мероприятия"
            number="05"
            tag="Мероприятия и заявки"
            tone="lime"
            title="Свои мероприятия и заявки"
            text="Вставьте ссылку на лендинг, пост или страницу на Timepad — получите черновик карточки. Опубликуйте мероприятие и принимайте заявки вместе с портфолио спикера."
            :ticks="[
              'Внутренние мероприятия видят только ваши спикеры, открытые — все',
              'Лендинг мероприятия со ссылкой, которой можно поделиться',
              'Заявка с аннотацией, ответами на ваши вопросы и портфолио',
            ]"
            flip
          >
            <template #cta>
              <app-button :to="{ name: 'connect' }" variant="line" class="self-start">
                Опубликовать мероприятие<ArrowRight />
              </app-button>
            </template>
            <app-tile as="figure" tone="lime" class="win" data-rv data-scene="700,1700,1000,1000,900,900,4500">
              <figcaption class="sr">Черновик мероприятия по ссылке, публикация и первая заявка</figcaption>
              <app-win-top title="Новое мероприятие" note="Ссылка · Черновик · Заявки" />
              <div class="mrow">
                <span class="k muted">Ссылка</span><b data-typed="1">timepad.ru/event/go-meetup</b>
              </div>
              <app-scene-bar :step="2" busy="Читаем страницу" done="Черновик готов, проверьте поля" />
              <div class="mrow" data-s="3"><span class="k muted">Название</span><b>Митап Go-разработчиков</b></div>
              <div class="mrow" data-s="3"><span class="k muted">Дата и город</span><b>20 ноября · Казань</b></div>
              <div class="mrow" data-s="3"><span class="k muted">Видимость</span><app-tag>Открытое</app-tag></div>
              <app-button as="span" variant="ink" sm class="self-start" aria-hidden="true" data-press="4"
                >Опубликовать</app-button
              >
              <div class="mrow" data-s="5">
                <span><b>Лендинг готов</b> <span class="small muted">· ссылка скопирована</span></span>
                <app-tag tone="ink">Открыть</app-tag>
              </div>
              <div class="mrow note" data-s="6">
                <div class="cell">
                  <b>Новая заявка</b>
                  <span class="small">«Профилирование Go в проде» · 5 выступлений в портфолио</span>
                </div>
                <app-tag>Спикер</app-tag>
              </div>
            </app-tile>
          </app-feature>

          <app-feature
            id="dash"
            label="Дашборд"
            number="06"
            tag="Дашборд"
            tone="lime"
            title="Отчёт собирается сам"
            text="Рейтинг спикеров внутри компании, внешний след, слепые зоны по темам и городам. Отчёт для руководства выгружается в один клик."
            :ticks="[
              'Рейтинг за подтверждённые выступления и рост, а не за клики',
              'Слепые зоны: темы и города без спикеров',
              'Выгрузка отчёта за квартал',
            ]"
          >
            <app-tile as="figure" tone="ink" class="win" data-rv data-scene="700,1300,1200,4200">
              <figcaption class="sr">Дашборд команды за квартал и слепая зона</figcaption>
              <app-win-top title="Дашборд" note="Q3 · 212 спикеров" />
              <div class="dash-stats" data-s="1">
                <div v-for="stat in stats" :key="stat.label">
                  <b class="num dash-v">{{ stat.value }}</b><span class="k muted">{{ stat.label }}</span>
                </div>
              </div>
              <div class="dash-bars" data-s="2">
                <template v-for="bar in bars" :key="bar.name">
                  <span class="small">{{ bar.name }}</span>
                  <i :style="{ width: `${bar.width}%` }" />
                  <span class="num">{{ bar.value }}</span>
                </template>
              </div>
              <div class="mrow" data-s="3">
                <span>Слепая зона</span><app-tag tone="pink">Mobile · Дальний Восток</app-tag>
              </div>
              <app-button as="span" variant="mint" sm class="self-start" aria-hidden="true" data-s="3"
                >Выгрузить отчёт</app-button
              >
            </app-tile>
          </app-feature>

          <app-feature
            id="privacy"
            label="Приватность"
            number="07"
            tag="Приватность"
            tone="lime"
            title="Кто что видит"
            text="Разбор доклада видит только спикер — даже вы его не видите. Поэтому спикеры загружают черновики и честно готовятся, а вы получаете больше выступлений и оценок зала."
            :ticks="[
              'Портфолио и оценки зала своих спикеров вы видите полностью',
              'Другие компании видят спикера только с его согласия и без оценок',
              'Сотрудник ушёл — выступления от имени компании остаются у вас',
            ]"
            flip
          >
            <app-tile as="figure" tone="slate" class="win" data-rv>
              <figcaption class="sr">Кто что видит в TRIX</figcaption>
              <div class="overflow-x-auto">
                <table class="who">
                  <thead>
                    <tr>
                      <th scope="col"><span class="sr">Данные</span></th>
                      <th v-for="col in whoCols" :key="col" scope="col" class="k">{{ col }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in who" :key="row.name" :class="{ key: row.key }">
                      <th scope="row">{{ row.name }}</th>
                      <td v-for="cell in row.cells" :key="cell" :class="!['Да', 'Нет'].includes(cell) && 'small'">
                        <app-tag v-if="cell === 'Да'" tone="mint">Да</app-tag>
                        <app-tag v-else-if="cell === 'Нет'" tone="dash">Нет</app-tag>
                        <template v-else>{{ cell }}</template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </app-tile>
          </app-feature>

          <app-faq :items="faq">
            Не нашли ответ — оставьте
            <router-link :to="{ name: 'connect' }" class="ln text-ink">заявку</router-link>
            и напишите вопрос при подключении.
          </app-faq>
        </div>
      </main>
    </div>
  </sp-page>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { useTemplateRef } from 'vue'
import AppButton from '@/components/AppButton.vue'
import AppFaq from '@/components/AppFaq.vue'
import AppFeature from '@/components/AppFeature.vue'
import AppHero from '@/components/AppHero.vue'
import AppHowStep from '@/components/AppHowStep.vue'
import AppPick from '@/components/AppPick.vue'
import AppPicks from '@/components/AppPicks.vue'
import AppSceneBar from '@/components/AppSceneBar.vue'
import AppTag from '@/components/AppTag.vue'
import AppTicker from '@/components/AppTicker.vue'
import AppTile from '@/components/AppTile.vue'
import AppWinTop from '@/components/AppWinTop.vue'
import SpPage from '@/components/speaker/SpPage.vue'
import SpStreamLabel from '@/components/speaker/SpStreamLabel.vue'
import { useFx, useScenes } from '@/composables/useFx'

const root = useTemplateRef<HTMLElement>('root')

const lines = [
  'В одном окне.',
  'Без отчётов в Excel.',
  'С оценками зала.',
  'Кого позвать — видно.',
  'Ничего не теряется.',
]

const anchors = [
  { label: 'Как это работает', hash: '#how' },
  { label: 'Спикеры', hash: '#speakers' },
  { label: 'Кого позвать', hash: '#invite' },
  { label: 'Мероприятия', hash: '#events' },
  { label: 'Вопросы', hash: '#faq' },
]

const people = [
  {
    name: 'Анна Ковалёва',
    initials: 'АК',
    text: 'Data Science · Казань · 6 выступлений',
    nps: '9.7',
    tone: 'mint',
    tag: 'Рекомендую',
    invited: false,
  },
  {
    name: 'Илья Морозов',
    initials: 'ИМ',
    text: 'Data Science · Новосибирск · 4 выступления',
    nps: '9.5',
    tone: 'yellow',
    tag: '',
    invited: false,
  },
  {
    name: 'Ольга Смирнова',
    initials: 'ОС',
    text: 'Data Science · Екатеринбург · из вашей таблицы',
    nps: '9.6',
    tone: 'pink',
    tag: 'Приглашена',
    invited: true,
  },
]

const stats = [
  { value: '148', label: 'выступлений' },
  { value: '9.1', label: 'средний NPS' },
  { value: '37', label: 'внешних сцен' },
]

const bars = [
  { name: 'Data Science', width: 84, value: 42 },
  { name: 'Backend', width: 74, value: 37 },
  { name: 'DevOps', width: 30, value: 15 },
  { name: 'Mobile', width: 18, value: 9 },
]

const whoCols = ['Спикер', 'Ваша команда', 'Другие компании']
const who = [
  { name: 'Портфолио выступлений', cells: ['Да', 'Да', 'При открытом профиле'] },
  { name: 'Оценки зала', cells: ['Да', 'Да', 'Нет'] },
  { name: 'Разбор доклада и аннотации', cells: ['Да', 'Нет', 'Нет'], key: true },
  { name: 'Рейтинг в компании', cells: ['Своё место', 'Весь', 'Нет'] },
  { name: 'Заявки', cells: ['Свои', 'На ваши мероприятия', 'На их мероприятия'] },
]

const faq = [
  {
    question: 'Как подключить организацию?',
    answer:
      'Оставьте заявку: название, рабочая почта и сайт. Мы сверим домен почты с сайтом и пришлём приглашение администратору. Дальше короткая настройка: направления, города, команда и спикеры.',
  },
  {
    question: 'Как пригласить спикеров?',
    answer:
      'Отправьте ссылку-приглашение или загрузите Excel любого вида. TRIX сам сопоставит колонки, приведёт значения к справочникам и разберёт прошлые выступления. Вы проверяете превью, приглашения рассылаем мы.',
  },
  {
    question: 'Видит ли команда разбор доклада?',
    answer:
      'Нет, разбор видит только спикер. Если бы команда видела черновики, спикеры перестали бы их загружать. Вы видите выступления, оценки зала и темы.',
  },
  {
    question: 'Откуда берутся мероприятия?',
    answer:
      'Прежде всего ваши: внутренние митапы, конференции и партнёрские слоты, которые вы добавляете по ссылке за минуту. Открытые конференции с приёмом докладов TRIX добавляет в подборку сам.',
  },
  {
    question: 'Увидят ли наших спикеров другие компании?',
    answer: 'Только если спикер сам откроет профиль. Оценки и рейтинг другим компаниям не видны.',
  },
  {
    question: 'Что будет, если сотрудник уйдёт?',
    answer: 'Портфолио останется у него, а выступления от имени компании — у вас. Новых выступлений вы уже не увидите.',
  },
  {
    question: 'Сколько стоит TRIX?',
    answer: 'В закрытой бете условия обсуждаем при подключении: оставьте заявку, и мы расскажем.',
  },
]

useFx(root, { words: 'landing', ink: true, fade: 0, rate: 260 })
useScenes(root)
</script>
