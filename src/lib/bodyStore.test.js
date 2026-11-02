import { describe, expect, it } from 'vitest'
import { changeOver, removeBody, seriesOf, upsertBody } from './bodyStore'

describe('upsertBody', () => {
  it('speichert, sortiert und ersetzt pro Tag', () => {
    let b = upsertBody({}, 'rene', '2026-10-10', { weight: '84,5' })
    b = upsertBody(b, 'rene', '2026-10-01', { weight: 85, waist: '' })
    b = upsertBody(b, 'rene', '2026-10-10', { weight: 84, waist: 90 })
    expect(b.rene).toEqual([{ date: '2026-10-01', weight: 85 }, { date: '2026-10-10', weight: 84, waist: 90 }])
  })
  it('verwirft ungültige Werte', () => {
    expect(upsertBody({}, 'rene', 'd', { weight: 'abc', arm: -3 }).rene).toEqual([])
  })
  it('löscht einen Tag', () => {
    expect(removeBody({ rene: [{ date: 'a', weight: 1 }] }, 'rene', 'a').rene).toEqual([])
  })
})

describe('changeOver', () => {
  const s = seriesOf([
    { date: '2026-09-01', weight: 86 },
    { date: '2026-10-01', weight: 85, waist: 92 },
    { date: '2026-10-30', weight: 84.2 },
  ], 'weight')
  it('vergleicht mit dem Wert vor ~30 Tagen', () => expect(changeOver(s, 30, '2026-11-02')).toEqual({ diff: -0.8, since: '2026-10-01' }))
  it('nimmt den ersten Wert, wenn nichts so alt ist', () => expect(changeOver(s, 365, '2026-11-02').since).toBe('2026-09-01'))
  it('braucht zwei Werte', () => expect(changeOver(s.slice(0, 1), 30, '2026-11-02')).toBeNull())
})
