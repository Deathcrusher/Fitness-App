import { describe, expect, it } from 'vitest'
import { ANKLE_Y, LEN, cycleLength, sample, solve } from './rig'
import { MOVES, moveFor } from './moves'
import { EXERCISE_LIBRARY, PROGRAM_TEMPLATES, builtinPlans } from '../plans'

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

describe('Animationen', () => {
  for (const [key, def] of Object.entries(MOVES)) {
    it(`${key}: Gelenke bleiben gültig und Glieder behalten ihre Länge`, () => {
      const total = cycleLength(def)
      for (let i = 0; i < 24; i++) {
        const t = (total * i) / 24
        const s = sample(def, t)
        const j = solve(s.pose, def, s.lift)
        for (const v of Object.values(j)) {
          if (Array.isArray(v)) v.forEach((n) => expect(Number.isFinite(n)).toBe(true))
        }
        const us = s.pose.upperScale ?? 1
        const ls = s.pose.legScale ?? 1
        for (const side of ['N', 'F']) {
          expect(dist(j['sh' + side], j['el' + side])).toBeCloseTo(LEN.upper * us, 0)
          expect(dist(j['el' + side], j['ha' + side])).toBeCloseTo(LEN.fore, 0)
          expect(dist(j['hp' + side], j['kn' + side])).toBeCloseTo(LEN.thigh * ls, 0)
          expect(dist(j['kn' + side], j['an' + side])).toBeCloseTo(LEN.shin * ls, 0)
        }
      }
    })
  }

  it('Wadenheben: Zehenspitzen bleiben am Boden und Fersen heben sich', () => {
    const def = MOVES.calfRaise
    const atStart = solve(sample(def, 0).pose, def)
    const atPeak = solve(sample(def, def.keys[0].hold + def.keys[0].dur).pose, def)
    expect(Math.abs(atStart.toN[1] - atPeak.toN[1])).toBeLessThan(2)
    expect(atPeak.anN[1]).toBeLessThan(atStart.anN[1] - 5)
    expect(atPeak.toN[1]).toBeGreaterThan(atPeak.anN[1])
  })

  it('Kniebeuge: Füße bleiben am Boden', () => {
    const def = MOVES.squat
    for (let i = 0; i < 20; i++) {
      const s = sample(def, (cycleLength(def) * i) / 20)
      const j = solve(s.pose, def, s.lift)
      expect(Math.abs(j.anN[1] - ANKLE_Y)).toBeLessThan(1.5)
    }
  })
})

describe('Zuordnung Übung → Animation', () => {
  const names = new Set()
  Object.values(builtinPlans).forEach((p) => p.days.forEach((d) => d.steps.forEach((s) => names.add(s.name))))
  PROGRAM_TEMPLATES.forEach((p) => p.days.forEach((d) => d.steps.forEach((s) => names.add(s.name))))
  EXERCISE_LIBRARY.forEach((s) => names.add(s.name))
  for (const name of names) {
    it(`„${name}“ hat eine Animation`, () => expect(moveFor({ name })).not.toBeNull())
  }
})
