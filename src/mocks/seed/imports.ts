import type { SpeakerImportQuestion, SpeakerImportRow } from '@/api/demo'
import { directions } from './dictionaries'

export const IMPORT_FILE_NAME = 'спикеры_2026.xlsx'

// Разбор таблицы всегда один: фикстура с доски «Онбординг организации, шаг 3». Меняется только имя файла.
export const importColumns = [
  { source: 'ФИО', target: 'Имя' },
  { source: 'Почта', target: 'Рабочая почта' },
  { source: 'Город/офис', target: 'Город' },
  { source: 'Стек', target: 'Направление' },
  { source: 'Где выступал', target: 'Прошлые выступления' },
]

export const importFound = { rows: 6, columns: 5, talks: 9 }

export const importQuestions: SpeakerImportQuestion[] = [
  {
    id: 'directions',
    type: 'directions',
    title: 'Колонка «Стек»: 2 значения не похожи на направления из справочника',
    values: [
      { id: 'v-1', raw: 'python, kafka, airflow', chosen: 'pc-data', candidates: ['pc-backend', 'pc-data'] },
      { id: 'v-2', raw: 'swift, kotlin', chosen: 'pc-mobile', candidates: ['pc-mobile'] },
    ],
    options: directions.map(({ id, name }) => ({ id, name })),
  },
  {
    id: 'missing-email',
    type: 'missing_email',
    title: 'Павел Лебедев — нет рабочей почты',
    row_id: 'row-6',
    person: 'Павел Лебедев',
  },
]

type RawRow = Omit<SpeakerImportRow, 'direction' | 'status'> & { direction_id: string; value_id?: string }

// Направления из колонки «Стек» зависят от ответа на первый вопрос, поэтому строки собираются при чтении.
export const importRows: RawRow[] = [
  {
    id: 'row-1',
    name: 'Анна Ковалёва',
    email: 'a.kovaleva@company.ru',
    city: 'Казань',
    direction_id: 'pc-backend',
    past_talks: [{ label: 'HighLoad', year: 2024 }],
    source_text: 'HighLoad 2024, докладчик',
  },
  {
    id: 'row-2',
    name: 'Илья Морозов',
    email: 'i.morozov@company.ru',
    city: 'Новосибирск',
    direction_id: 'pc-data',
    value_id: 'v-1',
    past_talks: [
      { label: 'Внутренний митап', year: 2025 },
      { label: 'Подкаст', year: 2024 },
    ],
    source_text: 'внутренний митап 2025, подкаст про данные',
  },
  {
    id: 'row-3',
    name: 'Мария Седова',
    email: 'm.sedova@company.ru',
    city: 'Москва',
    direction_id: 'pc-frontend',
    past_talks: [{ label: 'Внутренний митап', year: 2025 }],
    source_text: 'митап по фронтенду, 2025',
  },
  {
    id: 'row-4',
    name: 'Сергей Романов',
    email: 's.romanov@company.ru',
    city: 'Санкт-Петербург',
    direction_id: 'pc-mobile',
    value_id: 'v-2',
    past_talks: [],
    source_text: '—',
  },
  {
    id: 'row-5',
    name: 'Ольга Смирнова',
    email: 'o.smirnova@company.ru',
    city: 'Екатеринбург',
    direction_id: 'pc-devops',
    past_talks: [{ label: 'Конференция', year: 2023 }],
    source_text: 'доклад на конференции в 2023',
  },
  {
    id: 'row-6',
    name: 'Павел Лебедев',
    email: null,
    city: 'Москва',
    direction_id: 'pc-backend',
    past_talks: [{ label: 'Внутренний митап', year: null }],
    source_text: 'внутренний митап',
  },
]
