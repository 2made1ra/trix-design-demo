import type { Account, Db } from '../db'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly key: string,
  ) {
    super(key)
  }
}

/** Ответ с нестандартным статусом: 201 после создания, 204 без тела. */
export class Reply {
  constructor(
    readonly status: number,
    readonly data?: unknown,
  ) {}
}

export interface Ctx {
  params: Record<string, string>
  query: URLSearchParams
  /** Тело запроса: JSON разобран, multipart остался FormData */
  body: unknown
  user: Account | null
  db: Db
}

export type Handler = (ctx: Ctx) => unknown

export const fail = (status: number, key: string): never => {
  throw new ApiError(status, key)
}

export const created = (data: unknown) => new Reply(201, data)
export const noContent = () => new Reply(204)

export const requireUser = (ctx: Ctx): Account => ctx.user ?? fail(401, 'unauthorized')

export const requireOrg = (ctx: Ctx) => {
  const user = requireUser(ctx)
  return ctx.db.organizations.find((org) => org.id === user.org_id) ?? fail(404, 'organization_not_found')
}

export const jsonBody = <T extends object>(ctx: Ctx): Partial<T> =>
  ctx.body && typeof ctx.body === 'object' && !(ctx.body instanceof FormData) ? (ctx.body as Partial<T>) : {}

export const formBody = (ctx: Ctx): FormData => (ctx.body instanceof FormData ? ctx.body : fail(400, 'bad_request'))

export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`

export const nowIso = () => new Date().toISOString()
