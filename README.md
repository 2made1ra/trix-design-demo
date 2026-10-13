# TRIX design demo

Демо-сайт TRIX на моковых данных: вход, онбординг, подборка мероприятий, разбор доклада и кабинет организации.
Стек и сгенерированный клиент API те же, что в основном репозитории trix. Спека: `.claude/docs/specs/demo-mock-site.md`
в trix.

## Команды

- `npm run dev`: сайт на http://localhost:4173
- `npm run build`: проверка типов и сборка в `dist`
- `npm test`: vitest по мок-API
- `npm run check`: Biome

Деплой на Vercel: `vercel.json` отдаёт `dist` и переписывает все пути на `index.html`.

## Как устроены моки

- `src/api/fetcher.ts`: `customFetch` как в trix. Если `VITE_API` не равен `live`, запрос уходит в `src/mocks/router.ts`
  и возвращается настоящим `Response`, так что разбор ответов и ошибок один на оба режима.
- `src/api/generated.ts`: копия клиента из trix без правок. Эндпоинтов, которых нет в `api/openapi.yaml`, это не касается:
  они описаны в `src/api/demo.ts` с теми же сигнатурами.
- `src/mocks/router.ts`: таблица `METHOD путь → обработчик`, задержка 250–600 мс, ошибки в формате `{ key, message }`.
  Обработчики лежат в `src/mocks/handlers/`.
- `src/mocks/db.ts`: одна структура состояния, хранится в `localStorage` (`trix-demo:db`). Сид в `src/mocks/seed/`,
  демо-аккаунты и пароль в `src/mocks/seed/accounts.ts`.
- Долгие процессы (разбор доклада, импорт Excel) идут по статусам во времени: статус считается из момента создания,
  страница опрашивает раз в 1–2 с.
- Ссылка «Сбросить демо» в подвале очищает базу и вход.

## Как перенести в trix

Взять `src/pages/`, `src/composables/useAuth.ts`, `src/components/` и `src/api/demo.ts`, добавить маршруты из
`src/routes.ts`. Каталог `src/mocks/` и ветку мока в `fetcher.ts` не переносить: когда бэкенд получит методы из
`demo.ts`, они заработают на живом API.
