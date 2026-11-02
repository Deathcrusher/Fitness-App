import { describe, expect, it } from 'vitest'
import { afterRest, groupOf, partnerAfter, supersetLabel, upcoming } from './superset'

const steps = [
  { name: 'Aufwärmen' },
  { name: 'Rudern', superset: true },
  { name: 'Brustdrücken' },
  { name: 'Curls', superset: true },
  { name: 'Trizeps' },
  { name: 'Plank' },
]
const sets = { 0: 1, 1: 3, 2: 3, 3: 3, 4: 2, 5: 2 }
const setsOf = (i) => sets[i]

describe('groupOf', () => {
  it('findet die Gruppe von beiden Seiten', () => {
    expect(groupOf(steps, 1)).toEqual([1, 2])
    expect(groupOf(steps, 2)).toEqual([1, 2])
  })
  it('einzelne Übung ist keine Gruppe', () => expect(groupOf(steps, 5)).toBeNull())
  it('benennt Gruppen der Reihe nach', () => {
    expect(supersetLabel(steps, 2)).toMatchObject({ letter: 'A', pos: 2 })
    expect(supersetLabel(steps, 3)).toMatchObject({ letter: 'B', pos: 1 })
  })
})

describe('Ablauf', () => {
  it('nach A1 direkt zu A2 ohne Pause', () => expect(partnerAfter(steps, 1, 0, setOf())).toEqual({ step: 2, set: 0 }))
  it('nach A2 Pause, dann zurück zu A1 Satz 2', () => expect(afterRest(steps, 2, 0, setsOf)).toEqual({ step: 1, set: 1, done: [] }))
  it('nach dem letzten Durchgang zur nächsten Übung, beide erledigt', () => {
    expect(afterRest(steps, 2, 2, setsOf)).toEqual({ step: 3, set: 0, done: [1, 2] })
  })
  it('unterschiedliche Satzzahlen: fehlender Partner wird übersprungen', () => {
    expect(partnerAfter(steps, 3, 2, setsOf)).toBeNull()
    expect(afterRest(steps, 3, 2, setsOf)).toEqual({ step: 5, set: 0, done: [3, 4] })
  })
  it('normale Übung wie bisher', () => {
    expect(afterRest(steps, 5, 0, setsOf)).toEqual({ step: 5, set: 1, done: [] })
    expect(afterRest(steps, 5, 1, setsOf)).toEqual({ step: null, set: 0, done: [5] })
  })
  it('Vorschau', () => {
    expect(upcoming(steps, 1, 0, setsOf).kind).toBe('partner')
    expect(upcoming(steps, 2, 0, setsOf).kind).toBe('round')
    expect(upcoming(steps, 2, 2, setsOf).kind).toBe('step')
    expect(upcoming(steps, 5, 1, setsOf).kind).toBe('finish')
  })
})

function setOf() { return setsOf }
