import React from 'react'
import {describe,it,expect} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {NutritionMeters} from './Nutrition'
import HomeStudio from './HomeStudio'
import ProgramPicker from './ProgramPicker'
describe('Premium Studio',()=>{
 it('renders nutrition rings with real values and optional goals',()=>{
 const html=renderToStaticMarkup(<NutritionMeters sum={{kcal:1200,protein:85}} goals={{kcal:2400}}/>)
 expect(html).toContain('aria-valuenow="1200"')
 expect(html).toContain('stroke-dasharray="50 100"')
 expect(html).toContain('85')
 expect(html).toContain('Kein Tagesziel')
 })
 it('renders profile-specific home and hides redundant profile picker only when requested',()=>{
 const day={title:'Montag',focus:'Kraft A',steps:[{name:'Kniebeugen',reps:'2 x 8',type:'lower'}]}
 const plan={builtin:true,name:'Connie',days:[day]}
 const h=renderToStaticMarkup(<HomeStudio owner="connie" ownerName="Connie" programId="connie" plan={plan} day={day} history={[]} weekCount={0} goal={3} pauseSeconds={60} nutrition={{kcal:0,protein:0}} goals={{}}/>)
 expect(h).toContain('Fit &amp; Straff')
 expect(h).toContain('Kraft A')
 const picker=renderToStaticMarkup(<ProgramPicker plan={plan} person="connie" owner="connie" builtinEntries={[]} customEntries={[]} dayIndex={0} dueDay={0} showProfiles={false}/>)
 expect(picker).not.toContain('Person wählen')
 expect(picker).toContain('Grundtraining')
 })
})
