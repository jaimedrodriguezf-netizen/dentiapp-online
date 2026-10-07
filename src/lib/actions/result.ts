import type { ActionResult } from '@/types/action'

export function actionSuccess<T = void>(data: T, message?: string): ActionResult<T> {
  return { success: true, data, message }
}

export function actionError(error: string, code?: string): ActionResult<never> {
  return { success: false, error, code }
}
