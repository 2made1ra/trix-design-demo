<template>
  <org-shell rail>
    <div
      class="kicker flex min-h-10 flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-[#131313] px-5 py-2 text-(--side)"
    >
      <span>TRIX в закрытой бете: подключаем первые организации</span>
      <router-link :to="{ name: 'connect' }" class="text-l-mint shadow-[inset_0_-1px_0_currentColor]"
        >Оставить заявку</router-link
      >
    </div>

    <section class="pb-18">
      <header class="relative z-40">
        <div
          class="mx-auto flex min-h-17 max-w-360 flex-wrap items-center justify-between gap-x-8 px-4 sm:px-8 lg:px-16"
        >
          <router-link :to="{ name: 'home' }" class="brand text-ink hover:text-ink">TRIX</router-link>
          <nav aria-label="Основное меню" class="order-3 flex w-full gap-7 overflow-x-auto md:order-none md:w-auto">
            <a
              v-for="link in anchors"
              :key="link.href"
              :href="link.href"
              class="kicker flex h-12 shrink-0 items-center text-ink"
            >
              {{ link.label }}
            </a>
          </nav>
          <div class="flex items-center gap-7">
            <router-link v-if="user" :to="startPath" class="kicker text-ink">В кабинет</router-link>
            <router-link v-else :to="{ name: 'login' }" class="kicker text-ink">Войти</router-link>
            <org-button size="sm" :to="{ name: 'connect' }">Подключить организацию<ArrowRightIcon /></org-button>
          </div>
        </div>
      </header>

      <div class="mx-auto max-w-360 px-4 pt-16 sm:px-8 lg:px-16">
        <div class="mb-7 flex flex-wrap items-center gap-x-6 gap-y-2.5" data-rv>
          <nav class="org-sides" aria-label="Для кого TRIX">
            <router-link :to="{ name: 'speakers.landing' }" class="pick">Спикерам</router-link>
            <router-link :to="{ name: 'companies.landing' }" class="pick" aria-current="page">Компаниям</router-link>
          </nav>
          <span class="font-serif text-sm text-ink-2 italic">Спикеры, выступления, оценки зала</span>
        </div>
        <h1 class="shout text-[clamp(64px,8.9vw,128px)] max-sm:text-[56px]" data-rv>
          Все ваши спикеры.
          <span class="mt-[0.04em] table rounded-[0.06em] px-[0.1em] pt-[0.02em] text-[#131313] fill-lime">
            <span ref="typed" aria-hidden="true">{{ typedText }}</span>
            <span class="sr-only">В одном окне.</span>
          </span>
        </h1>
        <div class="mt-12 flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <p class="max-w-190 flex-[1_1_480px] font-serif text-[32px] leading-[1.2] max-sm:text-2xl" data-rv>
            Эксперты сами вносят выступления за 30 секунд, а команда видит,
            <span class="text-ink-2">кто, где и как выступил и кого позвать дальше.</span>
          </p>
          <div class="flex flex-wrap gap-3" data-rv>
            <org-button variant="ink" :to="{ name: 'connect' }">Подключить организацию<ArrowRightIcon /></org-button>
            <org-button variant="line" href="#how">Как это работает</org-button>
          </div>
        </div>
      </div>
    </section>

    <div class="mx-auto w-full max-w-360 px-4 sm:px-8 lg:px-16" data-rv>
      <div class="ticker fill-lime overflow-hidden rounded-full text-[#131313]" aria-hidden="true">
        <div class="ticker-track kicker">
          <template v-for="word in tickerWords" :key="word">
            <span>{{ word }}</span>
            <i class="size-1.5 rounded-full bg-(--side-deep)" />
          </template>
        </div>
      </div>
    </div>

    <main class="mx-auto w-full max-w-360 px-4 pt-24 pb-30 sm:px-8 lg:px-16">
      <div class="stream">
        <section id="how" class="stream-item" aria-labelledby="how-title">
          <div class="kicker pt-3.5 text-ink-2 max-md:pt-0">Как это работает<b class="block text-ink">01</b></div>
          <div class="flex min-w-0 flex-col gap-8 pb-12">
            <h2 id="how-title" class="shout text-d2" data-rv>Ваше флоу с TRIX</h2>
            <ol
              class="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]"
              data-scene="800,1100,700,1000,1100,700,600,600,3600"
            >
              <li class="tile tile-slate flex flex-col gap-7" data-rv>
                <div class="flex min-h-43 flex-col justify-center gap-3" aria-hidden="true">
                  <div class="org-row">
                    <span class="text-sm">Рабочая почта</span><b class="text-sm" data-typed="1">devrel@company.ru</b>
                  </div>
                  <span class="tag fill-mint self-start" data-s="2">Домен совпал</span>
                  <div class="org-row" data-s="3">
                    <span class="text-sm">212 спикеров</span><span class="tag fill-ink">Приглашены</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2.5">
                  <span class="kicker text-ink-2">Шаг 1</span>
                  <h3 class="text-2xl leading-[1.1] font-bold">Подключитесь и позовите спикеров</h3>
                  <p class="text-ink-2">
                    Заявка с рабочей почтой и проверка домена. Спикеров зовёте ссылкой или файлом Excel любого вида.
                  </p>
                </div>
              </li>
              <li class="tile tile-slate flex flex-col gap-7" data-rv>
                <div class="flex min-h-43 flex-col justify-center gap-3" aria-hidden="true">
                  <div class="org-row">
                    <span class="text-sm">Ссылка</span><b class="text-sm" data-typed="4">datafest.ru/program</b>
                  </div>
                  <div class="org-row" data-s="5">
                    <span class="text-sm">Новое выступление</span><span class="tag fill-lime">Анна К.</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2.5">
                  <span class="kicker text-ink-2">Шаг 2</span>
                  <h3 class="text-2xl leading-[1.1] font-bold">Спикеры вносят выступления</h3>
                  <p class="text-ink-2">
                    За 30 секунд по ссылке на программу, видео или пост. Взамен — подборка площадок и разбор доклада.
                  </p>
                </div>
              </li>
              <li class="tile tile-slate flex flex-col gap-7" data-rv>
                <div class="flex min-h-43 flex-col justify-center gap-3" aria-hidden="true">
                  <div class="flex flex-wrap gap-2">
                    <span class="pick" data-press="6">Data Science</span>
                    <span class="pick" data-press="7">NPS от 9.4</span>
                  </div>
                  <div class="org-row" data-s="8">
                    <span class="text-sm">Нашли спикеров</span><b class="font-mono text-xl">8</b>
                  </div>
                </div>
                <div class="flex flex-col gap-2.5">
                  <span class="kicker text-ink-2">Шаг 3</span>
                  <h3 class="text-2xl leading-[1.1] font-bold">Видите всех и зовёте нужных</h3>
                  <p class="text-ink-2">
                    Выступления, оценки зала и темы в одном окне. Под мероприятие TRIX предложит своих спикеров.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section id="speakers" class="stream-item" aria-labelledby="sp-title">
          <div class="kicker pt-3.5 text-ink-2 max-md:pt-0">Спикеры<b class="block text-ink">02</b></div>
          <div class="feat pb-12">
            <div class="feat-txt" data-rv>
              <span class="tag fill-lime self-start">Спикеры</span>
              <h2 id="sp-title" class="shout text-d3">Все эксперты в одном окне</h2>
              <p class="text-xl leading-[1.55] text-ink-2">
                Фильтруйте по направлению, городу, NPS, числу выступлений и уровню. Найти «NPS выше 9.4, Data Science,
                не Москва» — один запрос, а не неделя переписки.
              </p>
              <ul class="ticks text-sm">
                <li>Таблица спикеров с группировкой по городам</li>
                <li>Карточка спикера: выступления, темы, оценки зала</li>
                <li>Пока спикер не принял приглашение, видны данные из вашей таблицы</li>
              </ul>
              <org-button variant="ink" class="self-start" :to="{ name: 'connect' }"
                >Подключить организацию<ArrowRightIcon /></org-button
              >
            </div>
            <figure class="tile surface-ink org-win-demo" data-rv data-scene="700,1000,1200,4200">
              <figcaption class="sr-only">Демо: база спикеров с фильтром по направлению, NPS и городу</figcaption>
              <div class="flex items-center justify-between gap-4">
                <span class="text-2xl font-bold">Спикеры</span><span class="kicker opacity-70">212 · 14 городов</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span class="tag fill-mint text-[#131313]" data-s="1">Data Science</span>
                <span class="tag fill-mint text-[#131313]" data-s="1">NPS от 9.4</span>
                <span class="tag fill-mint text-[#131313]" data-s="1">Не Москва</span>
                <span class="tag">Конференции</span>
              </div>
              <div class="kicker opacity-70" data-s="1-1">Фильтруем 212 спикеров</div>
              <div class="kicker opacity-70" data-s="2">Нашли 8 спикеров</div>
              <div v-for="(person, i) in people" :key="person.name" class="org-row" :data-s="i < 2 ? 2 : 3">
                <div class="flex min-w-0 items-center gap-3">
                  <org-avatar :name="person.name" :tone="person.tone" />
                  <div class="flex min-w-0 flex-col gap-1">
                    <b>{{ person.name }}</b>
                    <span class="text-sm opacity-70">{{ person.text }}</span>
                  </div>
                </div>
                <div class="flex flex-none items-center gap-3">
                  <b class="font-mono">{{ person.nps }}</b>
                  <span v-if="person.tag" class="tag fill-mint text-[#131313]">{{ person.tag }}</span>
                  <span v-else-if="person.invited" class="tag tag-dash">Приглашена</span>
                </div>
              </div>
            </figure>
          </div>
        </section>

        <section id="talks" class="stream-item" aria-labelledby="talks-title">
          <div class="kicker pt-3.5 text-ink-2 max-md:pt-0">Выступления<b class="block text-ink">03</b></div>
          <div class="feat flip pb-12">
            <div class="feat-txt" data-rv>
              <span class="tag fill-lime self-start">Новые выступления</span>
              <h2 id="talks-title" class="shout text-d3">Выступления без отчётов</h2>
              <p class="text-xl leading-[1.55] text-ink-2">
                Спикеры вносят выступления сами, даже те, о которых вы не знали. Раз в неделю команда подтверждает их,
                ставит оценку и отмечает лучших.
              </p>
              <ul class="ticks text-sm">
                <li>Ссылка на программу, видео или пост вместо отчёта</li>
                <li>Подтверждённое выступление засчитывается спикеру</li>
                <li>«Рекомендую» — сигнал, кого звать на большие сцены</li>
              </ul>
            </div>
            <figure class="tile surface-lime org-win-demo" data-rv data-scene="700,1000,900,1100,4200">
              <figcaption class="sr-only">
                Демо: команда подтверждает новые выступления и отмечает «Рекомендую»
              </figcaption>
              <div class="flex items-center justify-between gap-4">
                <span class="text-2xl font-bold">Новые выступления</span
                ><span class="kicker opacity-70">Неделя · 5 новых</span>
              </div>
              <div class="org-row">
                <div class="flex min-w-0 flex-col gap-1">
                  <b>Анна Ковалёва — «Feature store без боли»</b
                  ><span class="text-sm opacity-70">Data Fest, Казань · программа по ссылке</span>
                </div>
                <span class="stack">
                  <span class="b-fake" data-s="0-1" data-press="1" aria-hidden="true">Подтвердить</span>
                  <span class="tag fill-ink" data-s="2">Засчитано</span>
                </span>
              </div>
              <div class="org-row">
                <div class="flex min-w-0 flex-col gap-1">
                  <b>Илья Морозов — «LLM в проде: что сломалось»</b
                  ><span class="text-sm opacity-70">Подкаст · запись выступления</span>
                </div>
                <span class="stack">
                  <span class="tag tag-dash" data-s="0-2">Ждёт подтверждения</span>
                  <span class="tag fill-ink" data-s="3">Рекомендую</span>
                </span>
              </div>
              <div class="org-row">
                <div class="flex min-w-0 flex-col gap-1">
                  <b>Ольга Смирнова — «A/B-тесты без мифов»</b
                  ><span class="text-sm opacity-70">Внутренний митап · пост в канале</span>
                </div>
                <span class="tag tag-dash">Ждёт подтверждения</span>
              </div>
            </figure>
          </div>
        </section>

        <section id="invite" class="stream-item" aria-labelledby="inv-title">
          <div class="kicker pt-3.5 text-ink-2 max-md:pt-0">Кого позвать<b class="block text-ink">04</b></div>
          <div class="feat pb-12">
            <div class="feat-txt" data-rv>
              <span class="tag fill-lime self-start">Кого позвать</span>
              <h2 id="inv-title" class="shout text-d3">Кого позвать — за минуту</h2>
              <p class="text-xl leading-[1.55] text-ink-2">
                Откройте мероприятие и нажмите «Кого позвать»: TRIX предложит ваших спикеров по теме, NPS и уровню и
                объяснит выбор. Решение и приглашение — за вами.
              </p>
              <ul class="ticks text-sm">
                <li>Причины словами: тема, оценки зала, опыт</li>
                <li>Предложение выступить приходит спикеру в TRIX</li>
                <li>Видно, кто согласился, а кто отказался</li>
              </ul>
            </div>
            <figure class="tile surface-mint org-win-demo" data-rv data-scene="700,1500,900,1000,4200">
              <figcaption class="sr-only">
                Демо: подбор своих спикеров под конференцию и предложение выступить
              </figcaption>
              <div class="flex items-center justify-between gap-4">
                <span class="text-2xl font-bold">Конференция о данных</span
                ><span class="kicker opacity-70">Трек ML · заявки до 20 ноября</span>
              </div>
              <span class="b-fake self-start" data-press="1" aria-hidden="true">Кого позвать</span>
              <div class="kicker opacity-70" data-s="1-1">Подбираем спикеров под трек</div>
              <div class="kicker opacity-70" data-s="2">Нашли 3 подходящих</div>
              <div class="org-row" data-s="2">
                <div class="flex min-w-0 flex-col gap-1">
                  <b>Анна Ковалёва</b
                  ><span class="text-sm opacity-70">Тема совпадает с треком, NPS 9.7 на последних выступлениях</span>
                </div>
                <span class="stack">
                  <span class="b-fake b-fake-line" data-s="2-2" aria-hidden="true">Предложить</span>
                  <span class="tag" data-s="3-3">Предложено</span>
                  <span class="tag fill-ink" data-s="4">Согласна</span>
                </span>
              </div>
              <div class="org-row" data-s="2">
                <div class="flex min-w-0 flex-col gap-1">
                  <b>Илья Морозов</b
                  ><span class="text-sm opacity-70">Выступал на этой конференции в прошлом году, NPS 9.5</span>
                </div>
                <span class="b-fake b-fake-line" aria-hidden="true">Предложить</span>
              </div>
              <div class="org-row" data-s="2">
                <div class="flex min-w-0 flex-col gap-1">
                  <b>Дмитрий Романов</b
                  ><span class="text-sm opacity-70">Сильная тема по MLOps, первая большая сцена</span>
                </div>
                <span class="b-fake b-fake-line" aria-hidden="true">Предложить</span>
              </div>
            </figure>
          </div>
        </section>

        <section id="events" class="stream-item" aria-labelledby="ev-title">
          <div class="kicker pt-3.5 text-ink-2 max-md:pt-0">Мероприятия<b class="block text-ink">05</b></div>
          <div class="feat flip pb-12">
            <div class="feat-txt" data-rv>
              <span class="tag fill-lime self-start">Мероприятия и заявки</span>
              <h2 id="ev-title" class="shout text-d3">Свои мероприятия и заявки</h2>
              <p class="text-xl leading-[1.55] text-ink-2">
                Вставьте ссылку на лендинг, пост или страницу на Timepad — получите черновик карточки. Опубликуйте
                мероприятие и принимайте заявки вместе с портфолио спикера.
              </p>
              <ul class="ticks text-sm">
                <li>Внутренние мероприятия видят только ваши спикеры, открытые — все</li>
                <li>Лендинг мероприятия со ссылкой, которой можно поделиться</li>
                <li>Заявка с аннотацией, ответами на ваши вопросы и портфолио</li>
              </ul>
              <org-button variant="line" class="self-start" :to="{ name: 'connect' }"
                >Опубликовать мероприятие<ArrowRightIcon /></org-button
              >
            </div>
            <figure class="tile surface-lime org-win-demo" data-rv data-scene="700,1700,1000,1000,900,900,4500">
              <figcaption class="sr-only">Демо: черновик мероприятия по ссылке, публикация и первая заявка</figcaption>
              <div class="flex items-center justify-between gap-4">
                <span class="text-2xl font-bold">Новое мероприятие</span
                ><span class="kicker opacity-70">Ссылка · Черновик · Заявки</span>
              </div>
              <div class="org-row">
                <span class="kicker opacity-70">Ссылка</span><b data-typed="1">timepad.ru/event/go-meetup</b>
              </div>
              <div class="kicker opacity-70" data-s="2-2">Читаем страницу</div>
              <div class="kicker opacity-70" data-s="3">Черновик готов, проверьте поля</div>
              <div class="org-row" data-s="3">
                <span class="kicker opacity-70">Название</span><b>Митап Go-разработчиков</b>
              </div>
              <div class="org-row" data-s="3">
                <span class="kicker opacity-70">Дата и город</span><b>20 ноября · Казань</b>
              </div>
              <div class="org-row" data-s="3">
                <span class="kicker opacity-70">Видимость</span><span class="tag">Открытое</span>
              </div>
              <span class="b-fake self-start" data-press="4" aria-hidden="true">Опубликовать</span>
              <div class="org-row" data-s="5">
                <span><b>Лендинг готов</b> <span class="text-sm opacity-70">· ссылка скопирована</span></span
                ><span class="tag fill-ink">Открыть</span>
              </div>
              <div class="org-row" data-s="6">
                <div class="flex min-w-0 flex-col gap-1">
                  <b>Новая заявка</b
                  ><span class="text-sm">«Профилирование Go в проде» · 5 выступлений в портфолио</span>
                </div>
                <span class="tag">Спикер</span>
              </div>
            </figure>
          </div>
        </section>

        <section id="dash" class="stream-item" aria-labelledby="dash-title">
          <div class="kicker pt-3.5 text-ink-2 max-md:pt-0">Дашборд<b class="block text-ink">06</b></div>
          <div class="feat pb-12">
            <div class="feat-txt" data-rv>
              <span class="tag fill-lime self-start">Дашборд</span>
              <h2 id="dash-title" class="shout text-d3">Отчёт собирается сам</h2>
              <p class="text-xl leading-[1.55] text-ink-2">
                Рейтинг спикеров внутри компании, внешний след, слепые зоны по темам и городам. Отчёт для руководства
                выгружается в один клик.
              </p>
              <ul class="ticks text-sm">
                <li>Рейтинг за подтверждённые выступления и рост, а не за клики</li>
                <li>Слепые зоны: темы и города без спикеров</li>
                <li>Выгрузка отчёта за квартал</li>
              </ul>
            </div>
            <figure class="tile surface-ink org-win-demo" data-rv data-scene="700,1300,1200,4200">
              <figcaption class="sr-only">Демо: дашборд команды за квартал и слепая зона</figcaption>
              <div class="flex items-center justify-between gap-4">
                <span class="text-2xl font-bold">Дашборд</span><span class="kicker opacity-70">Q3 · 212 спикеров</span>
              </div>
              <div class="grid grid-cols-3 gap-3" data-s="1">
                <div
                  v-for="stat in stats"
                  :key="stat.label"
                  class="flex flex-col gap-2 rounded-[14px] p-4 shadow-[inset_0_0_0_1px_var(--line)]"
                >
                  <b class="font-mono text-[34px] leading-none font-bold">{{ stat.value }}</b>
                  <span class="kicker opacity-70">{{ stat.label }}</span>
                </div>
              </div>
              <div
                class="grid grid-cols-[minmax(104px,auto)_minmax(0,1fr)_32px] items-center gap-x-3.5 gap-y-3"
                data-s="2"
              >
                <template v-for="bar in bars" :key="bar.name">
                  <span class="text-sm">{{ bar.name }}</span>
                  <i class="block h-2.5 rounded-sm bg-mint" :style="{ width: `${bar.width}%` }" />
                  <span class="font-mono">{{ bar.value }}</span>
                </template>
              </div>
              <div class="org-row" data-s="3">
                <span>Слепая зона</span><span class="tag fill-pink">Mobile · Дальний Восток</span>
              </div>
              <span class="b-fake self-start" data-s="3" aria-hidden="true">Выгрузить отчёт</span>
            </figure>
          </div>
        </section>

        <section id="privacy" class="stream-item" aria-labelledby="who-title">
          <div class="kicker pt-3.5 text-ink-2 max-md:pt-0">Приватность<b class="block text-ink">07</b></div>
          <div class="feat flip pb-12">
            <div class="feat-txt" data-rv>
              <span class="tag fill-lime self-start">Приватность</span>
              <h2 id="who-title" class="shout text-d3">Кто что видит</h2>
              <p class="text-xl leading-[1.55] text-ink-2">
                Разбор доклада видит только спикер — даже вы его не видите. Поэтому спикеры загружают черновики и честно
                готовятся, а вы получаете больше выступлений и оценок зала.
              </p>
              <ul class="ticks text-sm">
                <li>Портфолио и оценки зала своих спикеров вы видите полностью</li>
                <li>Другие компании видят спикера только с его согласия и без оценок</li>
                <li>Сотрудник ушёл — выступления от имени компании остаются у вас</li>
              </ul>
            </div>
            <figure class="tile tile-slate org-win-demo overflow-x-auto" data-rv>
              <figcaption class="sr-only">Кто что видит в TRIX</figcaption>
              <table class="org-who">
                <thead>
                  <tr>
                    <th scope="col"><span class="sr-only">Данные</span></th>
                    <th v-for="col in whoCols" :key="col" scope="col" class="kicker">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in who" :key="row.name" :class="row.key && 'key'">
                    <th scope="row">{{ row.name }}</th>
                    <td v-for="(cell, i) in row.cells" :key="i">
                      <span v-if="cell === 'Да'" class="tag fill-mint">Да</span>
                      <span v-else-if="cell === 'Нет'" class="tag tag-dash">Нет</span>
                      <span v-else class="text-sm">{{ cell }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </figure>
          </div>
        </section>

        <section id="faq" class="stream-item" aria-labelledby="faq-title">
          <div class="kicker pt-3.5 text-ink-2 max-md:pt-0">Вопросы<b class="block text-ink">08</b></div>
          <div class="grid min-w-0 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" data-rv>
            <div>
              <details v-for="(item, i) in faq" :key="item.q" class="org-faq" :open="i === 0">
                <summary>
                  <span class="text-2xl leading-[1.1] font-bold">{{ item.q }}</span><i aria-hidden="true" />
                </summary>
                <p class="max-w-205 pr-16 pb-6 text-ink-2">{{ item.a }}</p>
              </details>
            </div>
            <div class="flex flex-col gap-4 lg:order-first">
              <h2 id="faq-title" class="shout text-d3">Остались вопросы?</h2>
              <p class="text-xl leading-[1.55] text-ink-2">
                Не нашли ответ — оставьте
                <router-link :to="{ name: 'connect' }" class="text-ink shadow-[inset_0_-1px_0_currentColor]"
                  >заявку</router-link
                >
                и напишите вопрос при подключении.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="mx-auto w-full max-w-360 px-4 pb-6 sm:px-8 lg:px-16">
      <div class="glow-block flex flex-col gap-12 p-8 sm:p-12" data-rv>
        <div class="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          <div class="flex flex-col gap-3">
            <span class="kicker">Подключить организацию</span>
            <h2 class="shout text-d2">Подключите свою компанию</h2>
          </div>
          <org-button variant="ink" :to="{ name: 'connect' }">Оставить заявку<ArrowRightIcon /></org-button>
        </div>
        <div class="grid gap-8 text-sm sm:grid-cols-3">
          <div v-for="col in footCols" :key="col.title" class="flex flex-col gap-2.5">
            <span class="kicker text-ink-2">{{ col.title }}</span>
            <component
              :is="link.to ? 'router-link' : 'a'"
              v-for="link in col.links"
              :key="link.label"
              :to="link.to"
              :href="link.href"
              class="hover:text-link"
            >
              {{ link.label }}
            </component>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <span class="brand">TRIX</span>
          <span class="kicker text-ink-2">© 2026 TRIX</span>
        </div>
      </div>
    </footer>
    <app-footer />
  </org-shell>
</template>

<script setup lang="ts">
import { ArrowRightIcon } from '@lucide/vue'
import { ref, useTemplateRef } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import OrgAvatar from '@/components/org/OrgAvatar.vue'
import OrgButton from '@/components/org/OrgButton.vue'
import OrgShell from '@/components/org/OrgShell.vue'
import { useAuth } from '@/composables/useAuth'
import { useTyping } from '@/composables/useFx'

const { user, startPath } = useAuth()

const typed = useTemplateRef<HTMLElement>('typed')
const typedText = ref('В одном окне.')
useTyping(
  typed,
  ['В одном окне.', 'Без отчётов в Excel.', 'С оценками зала.', 'Кого позвать — видно.', 'Ничего не теряется.'],
  (text) => {
    typedText.value = text
  },
)

const anchors = [
  { label: 'Как это работает', href: '#how' },
  { label: 'Спикеры', href: '#speakers' },
  { label: 'Кого позвать', href: '#invite' },
  { label: 'Мероприятия', href: '#events' },
  { label: 'Вопросы', href: '#faq' },
]

const tickerWords = ['Спикеры', 'Новые выступления', 'Кого позвать', 'Дашборд']

const people = [
  {
    name: 'Анна Ковалёва',
    text: 'Data Science · Казань · 6 выступлений',
    nps: '9.7',
    tone: 'mint' as const,
    tag: 'Рекомендую',
    invited: false,
  },
  {
    name: 'Илья Морозов',
    text: 'Data Science · Новосибирск · 4 выступления',
    nps: '9.5',
    tone: 'yellow' as const,
    tag: '',
    invited: false,
  },
  {
    name: 'Ольга Смирнова',
    text: 'Data Science · Екатеринбург · из вашей таблицы',
    nps: '9.6',
    tone: 'pink' as const,
    tag: '',
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
    q: 'Как подключить организацию?',
    a: 'Оставьте заявку: название, рабочая почта и сайт. Мы сверим домен почты с сайтом и пришлём приглашение администратору. Дальше короткая настройка: направления, города, команда и спикеры.',
  },
  {
    q: 'Как пригласить спикеров?',
    a: 'Отправьте ссылку-приглашение или загрузите Excel любого вида. TRIX сам сопоставит колонки, приведёт значения к справочникам и разберёт прошлые выступления. Вы проверяете превью, приглашения рассылаем мы.',
  },
  {
    q: 'Видит ли команда разбор доклада?',
    a: 'Нет, разбор видит только спикер. Если бы команда видела черновики, спикеры перестали бы их загружать. Вы видите выступления, оценки зала и темы.',
  },
  {
    q: 'Откуда берутся мероприятия?',
    a: 'Прежде всего ваши: внутренние митапы, конференции и партнёрские слоты, которые вы добавляете по ссылке за минуту. Открытые конференции с приёмом докладов TRIX добавляет в подборку сам.',
  },
  {
    q: 'Увидят ли наших спикеров другие компании?',
    a: 'Только если спикер сам откроет профиль. Оценки и рейтинг другим компаниям не видны.',
  },
  {
    q: 'Что будет, если сотрудник уйдёт?',
    a: 'Портфолио останется у него, а выступления от имени компании — у вас. Новых выступлений вы уже не увидите.',
  },
  {
    q: 'Сколько стоит TRIX?',
    a: 'В закрытой бете условия обсуждаем при подключении: оставьте заявку, и мы расскажем.',
  },
]

type FootLink = { label: string; to?: { name: string }; href?: string }
const footCols: { title: string; links: FootLink[] }[] = [
  {
    title: 'Компаниям',
    links: [
      { label: 'Как это работает', href: '#how' },
      { label: 'Спикеры', href: '#speakers' },
      { label: 'Кого позвать', href: '#invite' },
      { label: 'Дашборд', href: '#dash' },
    ],
  },
  {
    title: 'Спикерам',
    links: [
      { label: 'Портфолио', to: { name: 'speakers.landing' } },
      { label: 'Подборка мероприятий', to: { name: 'speakers.landing' } },
      { label: 'Разбор доклада', to: { name: 'speakers.landing' } },
    ],
  },
  { title: 'Проект', links: [{ label: 'Оставить заявку', to: { name: 'connect' } }] },
]
</script>
