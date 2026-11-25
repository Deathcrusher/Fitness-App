import React from 'react'
import { ArrowUpRight,CalendarCheck2,Clock3,Dumbbell,Play,Utensils,Check,Activity,ChevronRight,HeartPulse } from 'lucide-react'
import { goalFor,isMaintenance } from '../lib/fitnessGoals'
import { estimateMinutes } from '../lib/logStore'
import { localDate,shiftDate } from '../lib/nutrition'
import { NutritionMeters } from './Nutrition'

export default function HomeStudio({owner,ownerName,programId,plan,day,history,weekCount,goal,pauseSeconds,nutrition,goals,active,onTraining,onNutrition,onProgress,onPrograms}){
 const profile=goalFor(owner,programId),today=localDate(),monday=shiftDate(today,-((new Date().getDay()+6)%7)),dates=new Set(history.map(e=>e.date))
 const balance=isMaintenance(owner), HeroIcon=balance?HeartPulse:Dumbbell
 const progress=goal>0?Math.max(0,Math.min(1,weekCount/goal)):0
 const dayNumber=String(Math.max(0,plan.days.indexOf(day))+1).padStart(2,'0')
 return <section className="ff3Page ff3Home">
  <header className="ff3SectionTitle ff4Welcome">
   <div><span className="ff3Kicker">{new Date().toLocaleDateString('de-AT',{weekday:'long',day:'numeric',month:'long'})}</span><h1>Hi, {ownerName}<span>.</span></h1><p>{balance?'Deine Fitness. Dein Tempo.':'Heute zählt dein nächster Schritt.'}</p></div>
   <button className="ff4ProfileTag" onClick={onPrograms} disabled={active}><HeroIcon size={17}/><span>{profile.title}</span><ChevronRight size={14}/></button>
  </header>
  <article className="ff3Hero ff4Workout">
   <div className="ff4HeroArt" aria-hidden="true"><span>{dayNumber}</span><HeroIcon strokeWidth={1.2}/><i/><b/></div>
   <div className="ff3HeroTop"><span><i/>{active?'TRAINING LÄUFT':'NÄCHSTE EINHEIT'}</span><span className="ff4HeroIndex">SESSION {dayNumber}</span></div>
   <div className="ff4HeroCopy"><small>{plan.builtin?'Grundtraining':plan.name} / {day.title}</small><h2>{day.focus}</h2><p>{day.tone}</p></div>
   <div className="ff3HeroMeta"><span><Clock3 size={17}/> ca. {estimateMinutes(day.steps,pauseSeconds)} Min.</span><span><Dumbbell size={17}/> {day.steps.length} Übungen</span></div>
   <button onClick={onTraining} className="ff3HeroButton"><span className="ff4Play"><Play size={18} fill="currentColor"/></span>{active?'Training fortsetzen':'Training öffnen'}<ArrowUpRight size={23}/></button>
  </article>
  <article className="ff3Panel ff4Rhythm">
   <div className="ff4WeekHead"><div><span className="ff3Kicker">DEIN RHYTHMUS</span><h2>Diese Woche</h2><p className="ff3Note">{weekCount} {weekCount===1?'Training':'Trainings'} abgeschlossen</p></div><div className="ff4WeekRing" aria-label={weekCount+' von '+goal+' Trainings'}><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" className="ff4RingTrack"/><circle cx="40" cy="40" r="34" className="ff4RingValue" pathLength="100" strokeDasharray={progress*100+' 100'} transform="rotate(-90 40 40)"/></svg><strong>{weekCount}<small>/{goal}</small></strong></div></div>
   <div className="ff3Week">{['Mo','Di','Mi','Do','Fr','Sa','So'].map((d,i)=>{const date=shiftDate(monday,i),done=dates.has(date);return <div key={d}><small>{d}</small><span className={(done?'done ':'')+(date===today?'today':'')} aria-label={date+(done?' Training absolviert':'')}>{done?<Check size={17}/>:Number(date.slice(-2))}</span></div>})}</div>
   <button className="ff3TextButton" onClick={onProgress}><CalendarCheck2 size={17}/> Fortschritt ansehen<ChevronRight size={17}/></button>
  </article>
  <article className="ff3Panel ff4NutritionCard"><div className="ff3PanelHead"><div><span className="ff3Kicker">HEUTE</span><h2>Deine Ernährung</h2></div><span className="ff4PanelIcon"><Utensils size={20}/></span></div><NutritionMeters sum={nutrition} goals={goals}/><button className="ff3TextButton" onClick={onNutrition}>Tagebuch öffnen <ChevronRight size={17}/></button></article>
  <article className="ff3Panel ff3ProfilePanel"><span className="ff4PanelIcon"><Activity size={21}/></span><div><span className="ff3Kicker">DEIN FOKUS</span><h2>{profile.title}</h2><p>{balance?'Kraft erhalten, Ausdauer verbessern und dich wohlfühlen.':'Kraft und Muskelaufbau langfristig entwickeln.'}</p></div><button disabled={active} onClick={onPrograms} className="ff3TextButton">Programme <ChevronRight size={17}/></button></article>
 </section>
}
