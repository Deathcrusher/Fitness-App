import {describe,it,expect} from 'vitest'
import {parseStepper,secondsUntil,timerMinutes} from './controlValues'
describe('Control values',()=>{
 it('accepts decimal comma for weights, but whole repetitions only',()=>{
 expect(parseStepper('12,5',0,500,true)).toBe(12.5)
 expect(parseStepper('8,5',0,200,false)).toBe(9)
 expect(parseStepper('',0,200)).toBeNull()
 expect(parseStepper('abc',0,200)).toBeNull()
 expect(parseStepper('1e2',0,200)).toBeNull()
 expect(parseStepper('999',0,200)).toBe(200)
 })
 it('uses absolute deadlines instead of interval counts',()=>{
 expect(secondsUntil(120000,90000)).toBe(30)
 expect(secondsUntil(120000,119500)).toBe(1)
 expect(secondsUntil(120000,121000)).toBe(0)
 expect(timerMinutes(null)).toBe(5)
 expect(timerMinutes('10')).toBe(10)
 })
})
