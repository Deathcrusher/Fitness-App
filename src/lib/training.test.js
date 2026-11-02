import { describe, expect, it } from 'vitest'
import { comebackFor, comebackFactor, e1rm, platesFor, roundWeight, sessionFeel, smartSuggestion } from './training'

const entry = (date, sets) => ({ date, sets })
const step = { type: 'upper', name: 'Rudern' }

describe('e1rm', () => {
  it('rechnet nach Epley', () => expect(e1rm({ w: 20, r: 10 })).toBeCloseTo(26.67, 1))
  it('ein Wiederholung ist das Gewicht selbst', () => expect(e1rm({ w: 30, r: 1 })).toBe(30))
  it('ohne Gewicht gibt es kein 1RM', () => expect(e1rm({ w: 0, r: 12 })).toBe(0))
  it('deckelt sehr hohe Wiederholungen', () => expect(e1rm({ w: 10, r: 40 })).toBe(e1rm({ w: 10, r: 15 })))
})

describe('roundWeight', () => {
  it('kleine Gewichte auf 0,5', () => expect(roundWeight(7.3)).toBe(7.5))
  it('große Gewichte auf ganze kg', () => expect(roundWeight(17.6)).toBe(18))
})

describe('comebackFor', () => {
  it('erkennt keine Pause bei regelmäßigem Training', () => {
    expect(comebackFor([entry('2026-10-20', [{ w: 20, r: 10 }]), entry('2026-10-27', [{ w: 20, r: 10 }])], '2026-11-02')).toBeNull()
  })
  it('reduziert nach 2 Monaten auf 70 %', () => {
    const cb = comebackFor([entry('2026-08-20', [{ w: 20, r: 10 }])], '2026-11-02')
    expect(cb.kind).toBe('restart')
    expect(cb.factor).toBe(0.7)
    expect(cb.target).toBe(14)
  })
  it('stuft nach Pausenlänge ab', () => {
    expect(comebackFactor(10)).toBe(1)
    expect(comebackFactor(20)).toBe(0.9)
    expect(comebackFactor(30)).toBe(0.8)
  })
  it('steigert nach dem Wiedereinstieg zurück', () => {
    const cb = comebackFor([entry('2026-08-20', [{ w: 20, r: 10 }]), entry('2026-10-30', [{ w: 14, r: 10 }])], '2026-11-02')
    expect(cb).toMatchObject({ kind: 'ramp', before: 20, now: 14 })
  })
  it('endet, sobald das alte Niveau erreicht ist', () => {
    expect(comebackFor([entry('2026-08-20', [{ w: 20, r: 10 }]), entry('2026-10-30', [{ w: 20, r: 10 }])], '2026-11-02')).toBeNull()
  })
  it('ignoriert die heutige Einheit', () => {
    expect(comebackFor([entry('2026-11-02', [{ w: 20, r: 10 }])], '2026-11-02')).toBeNull()
  })
})

describe('smartSuggestion', () => {
  const range = [8, 12]
  it('steigert bei allen Wiederholungen', () => {
    expect(smartSuggestion(entry('d', [{ w: 10, r: 12 }, { w: 10, r: 12 }]), range, step, null)).toMatchObject({ kind: 'up', w: 11 })
  })
  it('hält das Gewicht, wenn es hart war', () => {
    expect(smartSuggestion(entry('d', [{ w: 10, r: 12, f: 3 }, { w: 10, r: 12, f: 2 }]), range, step, null)).toMatchObject({ kind: 'hold', w: 10 })
  })
  it('größerer Schritt, wenn alles leicht war', () => {
    expect(smartSuggestion(entry('d', [{ w: 10, r: 12, f: 1 }, { w: 10, r: 12, f: 1 }]), range, step, null)).toMatchObject({ kind: 'up', w: 12 })
  })
  it('schlägt nach Pause reduziertes Gewicht vor', () => {
    const last = entry('2026-08-20', [{ w: 20, r: 10 }])
    const cb = comebackFor([last], '2026-11-02')
    expect(smartSuggestion(last, range, step, cb)).toMatchObject({ kind: 'comeback', w: 14, r: 8 })
  })
  it('führt in großen Schritten zum alten Niveau zurück', () => {
    const entries = [entry('2026-08-20', [{ w: 20, r: 10 }]), entry('2026-10-30', [{ w: 14, r: 10 }])]
    const cb = comebackFor(entries, '2026-11-02')
    expect(smartSuggestion(entries[1], range, step, cb)).toMatchObject({ kind: 'up', w: 16 })
  })
})

describe('sessionFeel', () => {
  it('ohne Bewertung neutral', () => expect(sessionFeel([{ w: 1, r: 1 }])).toBeNull())
  it('ein harter Satz reicht', () => expect(sessionFeel([{ f: 1 }, { f: 3 }])).toBe('hard'))
})

describe('platesFor', () => {
  it('verteilt auf beide Seiten', () => expect(platesFor(17, 2)).toEqual({ perSide: [5, 2.5], rest: 0, below: false }))
  it('meldet nicht erreichbare Reste', () => expect(platesFor(3, 2, [2.5]).rest).toBe(1))
  it('unter dem Stangengewicht', () => expect(platesFor(1, 2).below).toBe(true))
})
