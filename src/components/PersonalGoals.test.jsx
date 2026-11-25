import React from 'react'
import { describe,expect,it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProgressCalendar from './ProgressCalendar'
import {goalFor} from '../lib/fitnessGoals'
import {suggestion,draftFor} from '../lib/logStore'
describe('Personal fitness goals',()=>{
 const history=[{key:'r',owner:'rene',date:'2026-11-23',programName:'René',dayName:'Montag',volume:300,sets:5,durationSec:1800},{key:'c',owner:'connie',date:'2026-11-23',programName:'Connie',dayName:'Mittwoch',durationSec:1200}]
 const view=owner=>renderToStaticMarkup(<ProgressCalendar history={history} owner={owner} ownerName={owner} ownerOf={e=>e.owner}/>)
 it('shows separate progress views with heatmap only for muscle building',()=>{
 const r=view('rene'),c=view('connie')
 expect(r).toContain('Muskel-Heatmap');expect(r).toContain('Muskelaufbau')
 expect(c).not.toContain('Muskel-Heatmap');expect(c).toContain('Muskelerhalt');expect(c).toContain('Bewegungszeit diese Woche')
 expect(c).not.toContain('Rekordjäger');expect(c).not.toContain('Schwergewicht')
 expect(r).not.toContain('Mittwoch');expect(c).not.toContain('300 kg')
 })
 it('uses maintenance suggestions rather than automatic load increases',()=>{
 const s={name:'Bizeps-Curls',type:'upper',reps:'2 x 8'}
 const last={date:'2026-11-23',sets:[{w:5,r:8,f:1}]}
 expect(suggestion(last,[8,8],s,null,'rene').kind).toBe('up')
 expect(suggestion(last,[8,8],s,null,'connie')).toMatchObject({kind:'hold',w:5,r:8})
 expect(draftFor({log:{'connie::Bizeps-Curls':[last]},owner:'connie',step:s,setIndex:0,today:'2026-11-25'}).w).toBe(5)
 expect(goalFor('connie','connie-energy-balance-v1').title).toBe('Energy & Balance')
 })
})
