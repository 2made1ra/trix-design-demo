import type { City, PositionCategory } from '@/api/generated'

export const cities: City[] = [
  { id: 'city-msk', name: 'Москва', country: 'Россия', slug: 'moskva' },
  { id: 'city-spb', name: 'Санкт-Петербург', country: 'Россия', slug: 'sankt-peterburg' },
  { id: 'city-kzn', name: 'Казань', country: 'Россия', slug: 'kazan' },
  { id: 'city-nsk', name: 'Новосибирск', country: 'Россия', slug: 'novosibirsk' },
  { id: 'city-ekb', name: 'Екатеринбург', country: 'Россия', slug: 'ekaterinburg' },
  { id: 'city-nn', name: 'Нижний Новгород', country: 'Россия', slug: 'nizhniy-novgorod' },
  { id: 'city-krd', name: 'Краснодар', country: 'Россия', slug: 'krasnodar' },
  { id: 'city-sam', name: 'Самара', country: 'Россия', slug: 'samara' },
  { id: 'city-tms', name: 'Томск', country: 'Россия', slug: 'tomsk' },
  { id: 'city-tmn', name: 'Тюмень', country: 'Россия', slug: 'tyumen' },
]

export const directions: PositionCategory[] = [
  { id: 'pc-backend', name: 'Backend', slug: 'backend' },
  { id: 'pc-frontend', name: 'Frontend', slug: 'frontend' },
  { id: 'pc-mobile', name: 'Mobile', slug: 'mobile' },
  { id: 'pc-devops', name: 'DevOps', slug: 'devops' },
  { id: 'pc-data', name: 'Data и ML', slug: 'data-ml' },
  { id: 'pc-qa', name: 'QA', slug: 'qa' },
  { id: 'pc-security', name: 'Безопасность', slug: 'security' },
  { id: 'pc-product', name: 'Продукт', slug: 'product' },
  { id: 'pc-analytics', name: 'Аналитика', slug: 'analytics' },
]

export const cityByName = (name: string) => cities.find((city) => city.name === name) as City
export const directionByName = (name: string) =>
  directions.find((direction) => direction.name === name) as PositionCategory
