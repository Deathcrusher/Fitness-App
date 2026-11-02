import { describe, expect, it } from 'vitest'
import { leaderOf, weekStats } from '../components/DuelCard'

describe('Duell', () => {
  const start = new Date('2026-11-02T00:00:00')
  const h = [
    { date: '2026-11-02', owner: 'rene', durationSec: 1800, sets: 10, volume: 500 },
    { date: '2026-11-03', owner: 'connie', durationSec: 2400, sets: 8 },
    { date: '2026-10-30', owner: 'connie', durationSec: 2400, sets: 8 },
  ]
  const of = (e) => e.owner
  it('zählt nur die aktuelle Woche', () => expect(weekStats(h, of, 'connie', start)).toEqual({ count: 1, minutes: 40, sets: 8, volume: 0 }))
  it('bei gleich vielen Trainings entscheiden die Minuten', () => {
    expect(leaderOf(weekStats(h, of, 'rene', start), weekStats(h, of, 'connie', start))).toBe('b')
  })
  it('Gleichstand ohne Sieger', () => expect(leaderOf({ count: 1, minutes: 5 }, { count: 1, minutes: 5 })).toBeNull())
})
