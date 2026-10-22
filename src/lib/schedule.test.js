import { describe, expect, it } from 'vitest'
import { nextDueDay } from './schedule'

describe('nextDueDay', () => {
  const h = [
    { programId: 'rene', dayIndex: 0 },
    { programId: 'connie', dayIndex: 2 },
    { programId: 'rene', dayIndex: 1 },
  ]
  it('nimmt den Tag nach dem letzten Training dieses Programms', () => expect(nextDueDay(h, 'rene', 3)).toBe(2))
  it('beginnt nach dem letzten Tag wieder von vorn', () => expect(nextDueDay(h, 'connie', 3)).toBe(0))
  it('startet ohne Verlauf mit Tag 1', () => expect(nextDueDay([], 'rene', 3)).toBe(0))
})
