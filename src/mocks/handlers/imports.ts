import type { SpeakerImport, SpeakerImportAnswers, SpeakerImportQuestion, SpeakerImportRow } from '@/api/demo'
import type { StoredImport } from '../db'
import { cities, directions } from '../seed/dictionaries'
import { importColumns, importFound, importQuestions, importRows } from '../seed/imports'
import { type Ctx, created, fail, formBody, jsonBody, newId, noContent, nowIso, requireOrg } from './http'

// Этапы идут во времени, как на доске: загрузка 1,4 с, разбор 2,4 с, дальше вопросы.
export const UPLOAD_MS = 1400
export const PARSE_MS = 2400
const BYTES_IN_KB = 1024
const directionName = (id: string) => directions.find((direction) => direction.id === id)?.name ?? ''

const answered = (item: StoredImport) => {
  const { directions: chosen = {}, missing_email: emails = {} } = item.answers
  return importQuestions.every((question) =>
    question.type === 'directions' ? question.values.every((value) => chosen[value.id]) : !!emails[question.row_id],
  )
}

const stageOf = (item: StoredImport): SpeakerImport['stage'] => {
  const age = Date.now() - item.created_ms
  if (age < UPLOAD_MS) return 'upload'
  if (age < UPLOAD_MS + PARSE_MS) return 'parse'
  return answered(item) ? 'ready' : 'questions'
}

const rowsOf = (answers: SpeakerImportAnswers): SpeakerImportRow[] =>
  importRows.map(({ direction_id, value_id, ...row }) => {
    const email = answers.missing_email?.[row.id]
    const resolvedEmail = row.email ?? (email && 'email' in email ? email.email : null)
    const skipped = !!email && 'skip' in email
    return {
      ...row,
      email: resolvedEmail,
      direction: directionName((value_id && answers.directions?.[value_id]) || direction_id),
      status: skipped ? 'skipped' : resolvedEmail ? 'will_invite' : 'no_email',
    }
  })

const questionsOf = (answers: SpeakerImportAnswers): SpeakerImportQuestion[] =>
  importQuestions.map((question) =>
    question.type === 'directions'
      ? {
          ...question,
          values: question.values.map((value) => ({
            ...value,
            chosen: answers.directions?.[value.id] ?? value.chosen,
          })),
        }
      : question,
  )

const view = (item: StoredImport): SpeakerImport => {
  const stage = stageOf(item)
  const parsed = stage === 'questions' || stage === 'ready'
  const rows = parsed ? rowsOf(item.answers) : []
  const count = (status: SpeakerImportRow['status']) => rows.filter((row) => row.status === status).length
  return {
    id: item.id,
    file_name: item.file_name,
    size_kb: item.size_kb,
    stage,
    found: stage === 'upload' ? null : importFound,
    columns: stage === 'upload' ? [] : importColumns,
    questions: parsed ? questionsOf(item.answers) : [],
    rows,
    summary: { ready: count('will_invite'), no_email: count('no_email'), skipped: count('skipped') },
    sent_at: item.sent_at,
  }
}

const importOf = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const item = ctx.db.imports.find((entry) => entry.id === ctx.params.id && entry.org_id === org.id && !entry.cancelled)
  return item ?? fail(404, 'import_not_found')
}

export const createSpeakerImport = (ctx: Ctx) => {
  const org = requireOrg(ctx)
  const file = formBody(ctx).get('file')
  if (!(file instanceof File)) fail(400, 'bad_request')

  const { name, size } = file as File
  const item: StoredImport = {
    id: newId('imp'),
    org_id: org.id,
    file_name: name,
    size_kb: Math.max(1, Math.round(size / BYTES_IN_KB)),
    created_ms: Date.now(),
    answers: {},
    sent_at: null,
    cancelled: false,
  }
  ctx.db.imports.push(item)
  return created(view(item))
}

export const getSpeakerImport = (ctx: Ctx) => view(importOf(ctx))

export const answerSpeakerImport = (ctx: Ctx) => {
  const item = importOf(ctx)
  if (stageOf(item) === 'upload' || stageOf(item) === 'parse') fail(409, 'import_not_ready')

  const input = jsonBody<SpeakerImportAnswers>(ctx)
  item.answers = {
    directions: { ...item.answers.directions, ...input.directions },
    missing_email: { ...item.answers.missing_email, ...input.missing_email },
  }
  return view(item)
}

export const sendSpeakerImportInvites = (ctx: Ctx) => {
  const item = importOf(ctx)
  if (stageOf(item) !== 'ready' || item.sent_at) fail(409, 'import_not_ready')

  const invited = rowsOf(item.answers).filter((row) => row.status === 'will_invite')
  for (const row of invited) {
    ctx.db.speakers.push({
      id: newId('sp'),
      org_id: item.org_id,
      name: row.name,
      email: row.email,
      account_email: null,
      position: 'Добавлен из таблицы',
      direction_id: directions.find((direction) => direction.name === row.direction)?.id ?? '',
      city_id: cities.find((city) => city.name === row.city)?.id ?? '',
      level: null,
      talks_count: 0,
      nps: null,
      recommended: false,
      status: 'invited',
    })
  }
  item.sent_at = nowIso()
  return { sent: invited.length }
}

export const cancelSpeakerImport = (ctx: Ctx) => {
  importOf(ctx).cancelled = true
  return noContent()
}
