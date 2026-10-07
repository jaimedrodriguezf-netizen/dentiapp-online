import { describe, it, expect } from 'vitest'
import { actionSuccess, actionError } from './result'

describe('ActionResult Helpers', () => {
  it('creates success action result with data', () => {
    const res = actionSuccess({ id: '123' }, 'Creado con éxito')
    expect(res).toEqual({
      success: true,
      data: { id: '123' },
      message: 'Creado con éxito',
    })
  })

  it('creates error action result with message and optional code', () => {
    const res = actionError('No autorizado', 'UNAUTHORIZED')
    expect(res).toEqual({
      success: false,
      error: 'No autorizado',
      code: 'UNAUTHORIZED',
    })
  })
})
