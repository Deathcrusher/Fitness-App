// Separate additive diary; deletion markers prevent old snapshots resurrecting meals.
export const NUTRITION_KEY = 'fitflow-nutrition-v1'
export const NUTRITION_GOALS_KEY = 'fitflow-nutrition-goals-v1'
export const MEALS = ['Frühstück','Mittagessen','Abendessen','Snack']
const obj = x => x && typeof x === 'object' && !Array.isArray(x) ? x : {}
export function readNutrition(key=NUTRITION_KEY) {
  try { return obj(JSON.parse(localStorage.getItem(key)||'{}')) } catch { return {} }
}
export function localDate(date=new Date()) {
  return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')
}
export function shiftDate(date, n) {
  const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return localDate(d)
}
export function numberValue(raw) {
  if(raw == null || String(raw).trim()==='') return null
  const n=Number(String(raw).replace(',','.'))
  return Number.isFinite(n)&&n>=0 ? n : null
}
export function validMeal(raw) {
  const kcal=numberValue(raw.kcal), protein=numberValue(raw.protein)
  const name=String(raw.name||'').trim().slice(0,120)
  if(!name || kcal===null || protein===null || kcal>20000 || protein>1000) return null
  return {name,kcal:Math.round(kcal),protein:Math.round(protein*10)/10,meal:MEALS.includes(raw.meal)?raw.meal:'Snack'}
}
export function validGoals(raw) {
  const kcal=numberValue(raw.kcal), protein=numberValue(raw.protein)
  if((String(raw.kcal??'').trim() && kcal===null) || (String(raw.protein??'').trim() && protein===null) || (kcal!==null && (kcal<=0 || kcal>20000)) || (protein!==null && (protein<=0 || protein>1000))) return null
  return {kcal,protein}
}
export function dailyMeals(data,owner,date) {
  return Object.values(obj(data)).filter(e=>e && !e.deleted && e.owner===owner && e.date===date).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt))||String(a.id).localeCompare(String(b.id)))
}
export function totals(rows) {
  return {kcal:Math.round(rows.reduce((n,e)=>n+(Number(e.kcal)||0),0)),protein:Math.round(rows.reduce((n,e)=>n+(Number(e.protein)||0),0)*10)/10}
}
export function saveMeal(data,owner,date,raw,id,now=new Date().toISOString()) {
  const clean=validMeal(raw);if(!clean)return data
  const prev=data[id]
  if(prev && prev.owner!==owner)return data
  return {...data,[id]:{...clean,id,owner,date,createdAt:prev?.createdAt||now,updatedAt:now}}
}
export function removeMeal(data,owner,id,now=new Date().toISOString()) {
  const row=data[id];if(!row||row.owner!==owner)return data
  return {...data,[id]:{id,owner,date:row.date,deleted:true,updatedAt:now}}
}
export function mergeVersioned(a,b) {
  const result={...obj(b)}
  for(const [id,value] of Object.entries(obj(a))) {
    if(!value||typeof value!=='object')continue
    const prev=result[id], newer=String(value.updatedAt||'').localeCompare(String(prev?.updatedAt||''))
    if(!prev||newer>0||(newer===0 && (value.deleted || !prev.deleted)))result[id]=value
  }
  return Object.fromEntries(Object.entries(result).sort(([a],[b])=>a.localeCompare(b)))
}
