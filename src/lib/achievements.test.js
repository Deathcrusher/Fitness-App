import { describe, expect, it } from 'vitest'
import { achievementStats, evaluateAchievements, newlyUnlocked, weekComparison } from './achievements'

const e = (date, extra = {}) => ({ date, completedAt: `${date}T18:00:00`, ...extra })

describe('Abzeichen', () => {
  it('zählt die längste Wochenserie', () => {
    const h = [e('2026-09-28'), e('2026-10-06'), e('2026-10-13'), e('2026-10-21'), e('2026-11-09')]
    expect(achievementStats(h).streak).toBe(4)
  })
  it('meldet neu freigeschaltete Abzeichen genau einmal', () => {
    const before = []
    const after = [e('2026-10-22', { volume: 1200, records: 1 })]
    const ids = newlyUnlocked(before, after, 3).map((a) => a.id)
    expect(ids).toEqual(expect.arrayContaining(['first', 'ton', 'record']))
    expect(newlyUnlocked(after, after, 3)).toEqual([])
  })
  it('begrenzt den Fortschritt auf das Ziel', () => {
    const list = evaluateAchievements(Array.from({ length: 12 }, (_, i) => e(`2026-10-${String(i + 1).padStart(2, '0')}`)), 3)
    const ten = list.find((a) => a.id === 'ten')
    expect(ten).toMatchObject({ unlocked: true, value: 10 })
  })
})

describe('weekComparison', () => {
  it('vergleicht mit derselben Zeitspanne der Vorwoche', () => {
    const today = new Date('2026-10-22T15:00:00') // Donnerstag
    const h = [e('2026-10-20', { volume: 500 }), e('2026-10-13', { volume: 300 }), e('2026-10-17', { volume: 900 })]
    const c = weekComparison(h, today)
    expect(c.current).toMatchObject({ count: 1, volume: 500 })
    expect(c.previous).toMatchObject({ count: 1, volume: 300 })
    expect(c.previousFull).toMatchObject({ count: 2, volume: 1200 })
  })
})
