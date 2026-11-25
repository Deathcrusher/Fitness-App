import {describe,it,expect} from 'vitest'
import {coreSpecial,CORE_SPECIAL_ID} from './coreSpecial'
import {builtinPlans,parseSets} from './plansBase'
import {moveFor} from './figure/moves'
import {musclesOf} from './muscles'
import {ownerOfEntry} from './storage'
import {exerciseVideoFor} from './exerciseVideos'
describe('Bauch Spezial',()=>{
 it('is optional, separate and owned by René',()=>{
  expect(coreSpecial.owner).toBe('rene')
  expect(coreSpecial.builtin).toBeUndefined()
  expect(coreSpecial.days).toHaveLength(1)
  expect(ownerOfEntry({programId:CORE_SPECIAL_ID})).toBe('rene')
  const steps=coreSpecial.days[0].steps.filter(s=>s.type==='core')
  expect(steps.map(s=>s.name)).toEqual(['Crunches','Reverse Crunches','Bicycle Crunches','Plank'])
  expect(steps.reduce((n,s)=>n+parseSets(s.reps).sets,0)).toBe(8)
  for(const s of steps){expect(moveFor(s)).toBeTruthy();expect(musclesOf(s).abs).toBeGreaterThan(0)}
 })
 it('adds only two Wednesday core sets and retains the other days',()=>{
  const days=builtinPlans.rene.days
  expect(days[1].steps.at(-1)).toMatchObject({name:'Reverse Crunches',reps:'2 x 10-15'})
  expect(days.flatMap(d=>d.steps).filter(s=>s.type==='core').reduce((n,s)=>n+parseSets(s.reps).sets,0)).toBe(10)
  expect(builtinPlans.connie.days.flatMap(d=>d.steps).some(s=>s.name==='Reverse Crunches')).toBe(false)
  expect(exerciseVideoFor(days[1].steps.at(-1))?.id).toBe('wkP2kvSGIrI')
 })
})
