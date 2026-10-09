// Страницы сценария «Франкенштейн» в порядке холста
export const pages = [
  { id: 'home', slug: 'home', name: 'Главная TRIX', about: 'Лендинг продукта для новых спикеров', role: 'Гость' },
  { id: 'landing', slug: 'event', name: 'Лендинг мероприятия', about: 'Страница конференции с условиями и заявкой', role: 'Гость' },
  { id: 'onboarding', slug: 'onboarding', name: 'Онбординг, шаг 1', about: 'Сфера и опыт выступлений', role: 'Спикер' },
  { id: 'selection', slug: 'selection', name: 'Подборка мероприятий', about: 'Мероприятия под профиль спикера', role: 'Спикер' },
  { id: 'review', slug: 'review', name: 'Разбор доклада', about: 'Выводы после выступления', role: 'Спикер' },
  { id: 'growth', slug: 'growth', name: 'Развитие', about: 'Навыки и материалы под слабые места', role: 'Спикер' },
  { id: 'event-edit', slug: 'event-edit', name: 'Создание мероприятия', about: 'Форма организатора', role: 'Организатор' },
  { id: 'apps', slug: 'applications', name: 'Заявки', about: 'Заявки спикеров для организатора', role: 'Организатор' },
]

export const file = p => `fr-${p.id}.dc.html`
export const route = p => `/${p.slug}`

// Tweaks главной из разделов «… — для всех страниц»: общие для сайта, доски читают их из localStorage по ключу prefix + имя
export const shared = { page: 'home', section: /для всех страниц/, prefix: 'trix-fr:' }
