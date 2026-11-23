import { describe, expect, it } from 'vitest'
import { builtinPlans, parseSets } from './plansBase'

describe('René Ganzkörperplan 2026-11-23', () => {
  const rene = builtinPlans.rene

  it('bewahrt die drei Trainingstage und erstellt neue versionierte Trainings', () => {
    expect(rene.builtin).toBe(true)
    expect(rene.version).toBe('2026-11-23-ganzkoerper-2')
    expect(rene.days.map(d => d.title)).toEqual(['Montag','Mittwoch','Freitag'])
  })

  it('trainiert Unterarme und Waden zweimal pro Woche und hintere Oberschenkel gezielt', () => {
    const monday = rene.days[0].steps
    const wednesday = rene.days[1].steps
    const friday = rene.days[2].steps
    expect(monday.find(s => s.name === 'Wrist Curls')?.reps).toBe('2 x 12-15')
    expect(friday.find(s => s.name === 'Reverse Curls')?.reps).toBe('2 x 8-12')
    expect(monday.find(s => s.name === 'Wadenheben stehend')?.reps).toBe('2 x 15-20')
    expect(friday.find(s => s.name === 'Wadenheben stehend')?.reps).toBe('2 x 15-20')
    expect(wednesday.find(s => s.name === 'Rumänisches Kreuzheben mit Kurzhanteln')?.reps).toBe('2 x 10')
  })

  it('Plank am Montag bleibt 3 Sätze und andere bewährte Grundübungen bleiben', () => {
    const mon = rene.days[0].steps
    const plank = mon.find(s => s.name === 'Plank')
    expect(parseSets(plank.reps)).toMatchObject({ sets: 3, isSet: true })
    expect(['Kniebeugen','Rudern','Brustdrücken am Boden','Schulterdrücken','Bizeps-Curls']
      .every(name => mon.some(s => s.name === name))).toBe(true)
  })
})
