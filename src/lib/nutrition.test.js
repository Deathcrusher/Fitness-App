import {describe,it,expect} from 'vitest'
import {saveMeal,removeMeal,dailyMeals,totals,validMeal,validGoals,NUTRITION_KEY,mergeVersioned} from './nutrition'
import {mergeFitflowData} from './cloudMerge'
describe('Nutrition diary',()=>{
 it('separates profiles and dates, calculates totals and allows edit',()=>{
 const raw={name:'Shake',kcal:'250',protein:'45,5',meal:'Snack'}
 let d=saveMeal({},'rene','2026-11-25',raw,'a','2026-11-25T10:00:00Z')
 d=saveMeal(d,'connie','2026-11-25',raw,'b','2026-11-25T10:00:00Z')
 d=saveMeal(d,'rene','2026-11-24',raw,'c','2026-11-25T10:00:00Z')
 expect(totals(dailyMeals(d,'rene','2026-11-25'))).toEqual({kcal:250,protein:45.5})
 d=saveMeal(d,'rene','2026-11-25',{...raw,kcal:'300'},'a','2026-11-25T12:00:00Z')
 expect(totals(dailyMeals(d,'rene','2026-11-25')).kcal).toBe(300)
 expect(dailyMeals(d,'connie','2026-11-25')).toHaveLength(1)
 })
 it('does not resurrect deleted meals or overwrite newer entries in cloud merge',()=>{
 const old=saveMeal({},'rene','2026-11-25',{name:'Egg',kcal:90,protein:7},'a','2026-11-25T10:00:00Z')
 const deleted=removeMeal(old,'rene','a','2026-11-25T11:00:00Z')
 expect(mergeVersioned(old,deleted).a.deleted).toBe(true)
 const result=mergeFitflowData({[NUTRITION_KEY]:JSON.stringify(old),'fitflow-history-v1':'[]'},{[NUTRITION_KEY]:JSON.stringify(deleted)})
 expect(JSON.parse(result[NUTRITION_KEY]).a.deleted).toBe(true)
 expect(result['fitflow-history-v1']).toBe('[]')
 })
 it('accepts optional goals and rejects incomplete meals',()=>{
 expect(validGoals({kcal:'',protein:''})).toEqual({kcal:null,protein:null})
 expect(validGoals({kcal:'-1',protein:''})).toBeNull()
 expect(validMeal({name:'x',kcal:'',protein:20})).toBeNull()
 expect(validMeal({name:'x',kcal:20,protein:-1})).toBeNull()
 })
})
