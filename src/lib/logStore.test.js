import { describe, expect, it } from 'vitest'
import {
  baseName, draftFor, estimateMinutes, isLoggable, isRecord, suggestion, targetRange, upsertEntry, volumeOf,
} from './logStore'

const rudern = { type: 'upper', name: 'Rudern', reps: '3 x 10', detail: 'Hanteln zum Körper ziehen.' }
const entry = (date, sets) => ({ date, at: '', program: 'René', sets })

describe('targetRange', () => {
  it('liest feste und Bereichs-Wiederholungen', () => {
    expect(targetRange('3 x 12')).toEqual([12, 12])
    expect(targetRange('3 x 10-12')).toEqual([10, 12])
    expect(targetRange('2-3 x 8 je Bein')).toEqual([8, 8])
  })
})

describe('suggestion (doppelte Progression)', () => {
  it('schlägt mehr Gewicht vor, wenn alle Sätze das Ziel erreichen', () => {
    const s = suggestion(entry('2026-10-20', [{ w: 10, r: 10 }, { w: 10, r: 10 }, { w: 10, r: 10 }]), [10, 10], rudern)
    expect(s).toMatchObject({ kind: 'up', w: 11, r: 10 })
  })
  it('steigert bei Beinübungen in 2-kg-Schritten', () => {
    const s = suggestion(entry('d', [{ w: 20, r: 12 }]), [12, 12], { type: 'lower' })
    expect(s.w).toBe(22)
  })
  it('hält das Gewicht, wenn ein Satz zu kurz war', () => {
    const s = suggestion(entry('d', [{ w: 10, r: 10 }, { w: 10, r: 8 }]), [10, 12], rudern)
    expect(s).toMatchObject({ kind: 'hold', w: 10 })
  })
  it('erhöht bei Körpergewicht die Wiederholungen', () => {
    const s = suggestion(entry('d', [{ w: 0, r: 15 }, { w: 0, r: 15 }]), [15, 15], { type: 'lower' })
    expect(s).toMatchObject({ kind: 'up', w: 0, r: 16 })
  })
  it('liefert nichts ohne frühere Einheit', () => {
    expect(suggestion(null, [10, 10], rudern)).toBeNull()
  })
})

describe('isRecord', () => {
  const previous = [entry('a', [{ w: 10, r: 10 }]), entry('b', [{ w: 12, r: 8 }])]
  it('erkennt schwereres Gewicht', () => expect(isRecord(previous, { w: 13, r: 5 })).toBe(true))
  it('erkennt mehr Wdh. beim Bestgewicht', () => expect(isRecord(previous, { w: 12, r: 9 })).toBe(true))
  it('ignoriert schwächere Sätze', () => expect(isRecord(previous, { w: 11, r: 12 })).toBe(false))
  it('zählt die erste Einheit nicht als Rekord', () => expect(isRecord([], { w: 50, r: 1 })).toBe(false))
})

describe('upsertEntry', () => {
  it('ersetzt den Eintrag vom selben Tag und sortiert nach Datum', () => {
    let log = upsertEntry({}, 'rene', 'Rudern', '2026-10-22', [{ w: 10, r: 10 }], 'René')
    log = upsertEntry(log, 'rene', 'Rudern', '2026-10-20', [{ w: 9, r: 10 }], 'René')
    log = upsertEntry(log, 'rene', 'Rudern', '2026-10-22', [{ w: 11, r: 10 }, null], 'René')
    expect(log['rene::Rudern'].map((e) => e.date)).toEqual(['2026-10-20', '2026-10-22'])
    expect(log['rene::Rudern'][1].sets).toEqual([{ w: 11, r: 10 }])
  })
  it('fasst links/rechts zu einer Übung zusammen', () => {
    expect(baseName('Knie heben – links')).toBe('Knie heben')
  })
})

describe('draftFor', () => {
  it('nimmt den Vorschlag als Startwert', () => {
    const log = { 'rene::Rudern': [entry('2026-10-20', [{ w: 10, r: 10 }, { w: 10, r: 10 }])] }
    expect(draftFor({ log, owner: 'rene', step: rudern, setIndex: 0, today: '2026-10-22', sessionSets: [] })).toEqual({ w: 11, r: 10 })
  })
  it('übernimmt im selben Training den vorherigen Satz', () => {
    expect(draftFor({ log: {}, owner: 'rene', step: rudern, setIndex: 1, today: 'x', sessionSets: [{ w: 12, r: 9 }] })).toEqual({ w: 12, r: 9 })
  })
  it('startet ohne Verlauf mit der unteren Zielzahl', () => {
    expect(draftFor({ log: {}, owner: 'rene', step: { ...rudern, reps: '3 x 8-10' }, setIndex: 0, today: 'x' })).toEqual({ w: 0, r: 8 })
  })
})

describe('Hilfsfunktionen', () => {
  it('berechnet Volumen', () => expect(volumeOf([{ w: 10, r: 10 }, { w: 0, r: 20 }, null])).toBe(100))
  it('erkennt protokollierbare Übungen', () => {
    expect(isLoggable(rudern)).toBe(true)
    expect(isLoggable({ type: 'core', name: 'Plank', reps: '3 x 30-45 Sek' })).toBe(false)
    expect(isLoggable({ type: 'warmup', name: 'Marschieren', reps: '60 Sek' })).toBe(false)
  })
  it('schätzt eine plausible Trainingsdauer', () => {
    const steps = [{ type: 'warmup', reps: '60 Sek' }, { type: 'upper', reps: '3 x 10' }, { type: 'cardio', reps: '15–20 Min' }]
    const min = estimateMinutes(steps, 60)
    expect(min).toBeGreaterThanOrEqual(20)
    expect(min).toBeLessThanOrEqual(30)
  })
})
