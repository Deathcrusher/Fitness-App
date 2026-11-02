import { describe, expect, it } from 'vitest'
import { heatLevel, logMusclesOn, muscleSetsFor, musclesOf, workoutMuscles } from './muscles'

describe('musclesOf', () => {
  it('Kniebeugen treffen Beine und Po', () => expect(musclesOf({ name: 'Kniebeugen', type: 'lower' })).toMatchObject({ quads: 1, glutes: 1 }))
  it('Rudern trifft den Rücken', () => expect(musclesOf({ name: 'Rudern mit Hanteln', type: 'upper' }).back).toBe(1))
  it('Aufwärmen zählt nicht', () => expect(musclesOf({ name: 'Kniebeugen', type: 'warmup' })).toEqual({}))
  it('unbekannte Kraftübung nach Typ', () => expect(musclesOf({ name: 'Irgendwas', type: 'core' }).abs).toBe(1))
})

describe('workoutMuscles', () => {
  const steps = [
    { name: 'Kniebeugen', type: 'lower', reps: '3 x 10' },
    { name: 'Plank', type: 'core', reps: '3 x 30 Sek' },
    { name: 'Rudern', type: 'upper', reps: '3 x 10' },
  ]
  it('zählt geloggte Sätze, sonst geplante, übersprungene nicht', () => {
    const out = workoutMuscles(steps, { 0: true, 1: true, 2: 'skipped' }, { 0: [{ w: 10, r: 10 }, { w: 10, r: 10 }] })
    expect(out.quads).toBe(2)
    expect(out.abs).toBe(3)
    expect(out.back).toBeUndefined()
  })
})

describe('muscleSetsFor', () => {
  const log = { 'rene::Kniebeugen': [{ date: '2026-10-30', sets: [{ w: 10, r: 10 }, { w: 10, r: 10 }] }] }
  const history = [
    { date: '2026-10-30', programId: 'rene' },
    { date: '2026-10-31', programId: 'rene', muscles: { back: 3 } },
    { date: '2026-10-31', programId: 'connie', muscles: { back: 9 } },
  ]
  it('kombiniert gespeicherte Werte und altes Satz-Log', () => {
    const out = muscleSetsFor({ history, log, owner: 'rene', ownerOf: (e) => e.programId, from: '2026-10-27', to: '2026-11-03' })
    expect(out).toMatchObject({ quads: 2, back: 3 })
  })
  it('liest das Log ohne Seitenangabe', () => {
    expect(logMusclesOn({ 'rene::Knie heben': [{ date: 'd', sets: [{ r: 1 }] }] }, 'rene', 'd')).toEqual({})
  })
})

describe('heatLevel', () => {
  it('stuft ab', () => expect([0, 2, 4, 8, 12].map(heatLevel)).toEqual([0, 1, 2, 3, 4]))
})
