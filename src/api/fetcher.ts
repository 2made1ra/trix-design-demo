const errors: Record<string, string> = {
  network_error: 'Не удалось связаться с сервером',
  internal_error: 'Внутренняя ошибка сервера',
  bad_request: 'Некорректные данные',
  unauthorized: 'Требуется авторизация',
  forbidden: 'Недостаточно прав',
  invalid_credentials: 'Неверная почта или пароль',
  invalid_cursor: 'Список устарел, обновите страницу',
  invalid_url: 'Ссылка должна начинаться с http:// или https://',
  invalid_material: 'Укажите ссылку или файл',
  unsupported_file_type: 'Этот тип файла не поддерживается',
  file_not_found: 'Файл ещё не загружен',
  slug_taken: 'Такой ключ уже занят',
  username_taken: 'Пользователь с таким никнеймом уже существует',
  email_taken: 'Пользователь с такой почтой уже существует',
  duplicate_speaker: 'Спикер указан несколько раз',
  has_presentations: 'Сначала удалите или перенесите доклады',
  review_exists: 'Вы уже оставили отзыв на этот доклад',
  cannot_follow_self: 'Нельзя подписаться на себя',
  own_role: 'Нельзя менять свою роль',
  ai_chat_processing: 'ИИ ещё отвечает на предыдущее сообщение',
  nothing_to_confirm: 'Нечего подтверждать',
  application_reviewed: 'По заявке уже есть решение',
  application_locked: 'Заявка отозвана или из неё уже создан доклад',
  application_not_ready: 'Заявка не принята или доклад уже создан',
  conference_not_found: 'Конференция не найдена',
  section_not_found: 'Секция не найдена',
  presentation_not_found: 'Доклад не найден',
  profile_not_found: 'Профиль не найден',
  cfp_not_found: 'CFP не найден',
  cfp_application_not_found: 'Заявка не найдена',
  ai_chat_not_found: 'Чат не найден',
  talk_review_not_found: 'Разбор не найден',
  text_not_extracted: 'Не удалось извлечь текст из файла. Загрузите файл с текстом или вставьте текст вручную',
  invite_not_found: 'Приглашение не найдено',
  invite_expired: 'Ссылка из письма больше не действует: срок вышел или приглашение уже использовано',
  organization_not_found: 'Организация не найдена',
  import_not_found: 'Импорт не найден',
  import_not_ready: 'Файл ещё разбирается или остались вопросы без ответа',
  offer_answered: 'На предложение уже дан ответ',
  speaker_not_found: 'Спикер не найден',
  talk_not_found: 'Выступление не найдено',
  offer_not_found: 'Предложение не найдено',
  offer_exists: 'Этому спикеру уже отправлено предложение на это мероприятие',
  event_not_found: 'Мероприятие не найдено',
  password_required: 'Введите пароль',
}

export const customFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  const token = localStorage.getItem('token')
  const visitorId = localStorage.getItem('visitor_id')
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (visitorId) headers.set('X-Visitor-Id', visitorId)

  let res: Response
  try {
    // Мок-слой подключается только в демо. Для живого бэкенда задайте VITE_API=live.
    if (import.meta.env.VITE_API === 'live') res = await fetch(url, { ...options, headers })
    else res = await (await import('@/mocks/router')).mockFetch(url, { ...options, headers })
  } catch {
    return { data: { key: 'network_error', message: errors.network_error }, status: 0, headers: new Headers() } as T
  }

  if (res.status === 401 && token) {
    localStorage.removeItem('token')
    window.location.assign('/login')
  }

  const body = [204, 205, 304].includes(res.status) ? '' : await res.text()
  let data: unknown = {}
  try {
    data = body ? JSON.parse(body) : {}
  } catch {
    data = { key: 'internal_error', message: errors.internal_error }
  }

  if (!res.ok) {
    const error = data as { key?: string; message?: string }
    error.message = errors[error.key ?? ''] ?? error.message ?? errors.internal_error
  }

  return { data, status: res.status, headers: res.headers } as T
}
