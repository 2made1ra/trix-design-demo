// Варианты дизайна и страницы сценария в порядке холста
export const systems = [
  {
    id: 'base',
    slug: 'baseline',
    name: 'Baseline',
    tagline: 'Текущий стиль TRIX',
    about: 'Как TRIX выглядит сейчас: белый фон, графитовые кнопки, синие ссылки. От него отсчитываем остальные варианты.',
    fonts: 'Space Grotesk · Inter · Space Mono',
    display: "'Space Grotesk', sans-serif",
    look: { bg: '#f6f5f1', ink: '#17171c', accent: '#1863dc' },
    colors: ['#17171c', '#1863dc', '#f6f5f1', '#ffffff'],
  },
  {
    id: 'bp',
    slug: 'baseline-plus',
    name: 'Baseline+',
    tagline: 'Cohere с медиа, тёмными полосами и AI-консолью',
    about: 'Развитие текущего стиля: градиентные mesh-обложки, тёмные полосы-акценты, коралловые детали и консоль AI-помощника.',
    fonts: 'Geist · Geist Mono',
    display: "'Geist', sans-serif",
    look: { bg: '#17171c', ink: '#ffffff', accent: '#ff7759' },
    colors: ['#17171c', '#ff7759', '#c3cfff', '#003c33', '#eeece7'],
  },
  {
    id: 'sg',
    slug: 'sunset-glow',
    name: 'Sunset Glow',
    tagline: 'Тёплая редакционная',
    about: 'Закатные градиенты, кремовые поверхности и антиква в заголовках. Собрана из компонентов дизайн-системы Sunset Glow.',
    fonts: 'Cormorant Garamond · Inter',
    display: "'Cormorant Garamond', serif",
    look: { bg: '#fff8e0', ink: '#1c1c1e', accent: '#fa520f' },
    colors: ['#fa520f', '#ffa110', '#ffd06a', '#fff8e0', '#cc3a05'],
  },
  {
    id: 'st',
    slug: 'stripe',
    name: 'Stripe',
    tagline: 'Индиго и navy, Inter 300, след курсора-волна',
    about: 'Строгая продуктовая эстетика: тонкий Inter, индиго на navy, живые градиенты в шапке и аккуратные тени карточек.',
    fonts: 'Inter 300 · Inter',
    display: "'Inter', sans-serif",
    look: { bg: '#0d253d', ink: '#ffffff', accent: '#533afd' },
    colors: ['#533afd', '#0d253d', '#f6f9fc', '#ea2261', '#f96bee'],
  },
  {
    id: 'vg',
    slug: 'verge',
    name: 'The Verge',
    tagline: 'Светлая редакция, лента-таймлайн, анимации',
    about: 'Медийная подача: узкий гротеск крупным кеглем, мятный и ультрафиолетовый акценты, лента-таймлайн и больше всего анимаций.',
    fonts: 'Sofia Sans Extra Condensed · Onest · Martian Mono',
    display: "'Sofia Sans Extra Condensed', sans-serif",
    look: { bg: '#3cffd0', ink: '#131313', accent: '#5200ff' },
    colors: ['#131313', '#3cffd0', '#5200ff', '#f2f2f2'],
  },
]

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

export const file = (s, p) => (s.id === 'base' && p.id === 'landing' ? 'Main.dc.html' : `${s.id}-${p.id}.dc.html`)
export const route = (s, p) => `/${s.slug}/${p.slug}`
