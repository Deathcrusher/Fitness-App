import { describe,it,expect } from 'vitest'
import { ENERGY_ID, energyPlan, workSecondsFor } from './energyPlan'
import { builtinPlans, timedSeconds } from './plans'
import { MOVES, moveFor } from './figure/moves'
import { suggestion } from './logStore'
describe('Energy & Balance – independent preset',()=>{
 it('keeps existing builtins untouched and belongs to Connie',()=>{
  const before=JSON.stringify(builtinPlans)
  const p=energyPlan()
  expect(p.id).toBe(ENERGY_ID); expect(p.owner).toBe('connie')
  expect(p.days.map(d=>d.title)).toEqual(['Montag','Mittwoch','Freitag'])
  expect(Object.keys(builtinPlans)).not.toContain(ENERGY_ID)
  expect(JSON.stringify(builtinPlans)).toBe(before)
 })
 it('adjusts load without changing the order or exercise count',()=>{
  const modes=['low','normal','high'].map(energyPlan)
  expect(modes.map(p=>p.days[1].steps[0].durationSec)).toEqual([600,900,1200])
  expect(modes[0].days[0].steps[1].reps).toBe('1 x 5-6')
  for(const p of modes) for(const [i,d] of p.days.entries()) expect(d.steps.map(s=>s.name)).toEqual(modes[1].days[i].steps.map(s=>s.name))
 })
 it('has a motion definition for every exercise and working cardio/yoga timers',()=>{
  for(const d of energyPlan().days) for(const s of d.steps) {
   expect(MOVES[moveFor(s)]).toBeDefined()
   if(s.durationSec) expect(workSecondsFor(s,timedSeconds)).toBe(s.durationSec)
   expect(suggestion({sets:[{r:12,w:5}]},[8,10],s)).toBeNull()
  }
 })
})
