import React from 'react'
import { ArrowUpRight,CalendarCheck2,Clock3,Dumbbell,Play,Utensils,Check,Activity,ChevronRight } from 'lucide-react'
import { goalFor,isMaintenance } from '../lib/fitnessGoals'
import { estimateMinutes } from '../lib/logStore'
import { localDate,shiftDate } from '../lib/nutrition'
import { NutritionMeters } from './Nutrition'
export default function HomeStudio({owner,ownerName,programId,plan,day,history,weekCount,goal,pauseSeconds,nutrition,goals,active,onTraining,onNutrition,onProgress,onPrograms}){
 const profile=goalFor(owner,programId),today=localDate(),monday=shiftDate(today,-((new Date().getDay()+6)%7)),dates=new Set(history.map(e=>e.date))
 return <section className="ff3Page ff3Home">
 <div className="ff3SectionTitle"><div><span className="ff3Kicker">{new Date().toLocaleDateString('de-AT',{weekday:'long',day:'numeric',month:'long'})}</span><h1>Hi, {ownerName}.</h1><p>{profile.label} · dein eigenes Tempo.</p></div><div className="ff3ProfileMark"><Activity size={25}/></div></div>
 <article className="ff3Hero"><div className="ff3HeroTop"><span>{active?'TRAINING LÄUFT':'DEIN NÄCHSTES WORKOUT'}</span><Dumbbell size={25}/></div><div><small>{plan.builtin?'Grundtraining':plan.name} · {day.title}</small><h2>{day.focus}</h2><p>{day.tone}</p></div><div className="ff3HeroMeta"><span><Clock3 size={16}/> ca. {estimateMinutes(day.steps,pauseSeconds)} Min</span><span><Dumbbell size={16}/> {day.steps.length} Übungen</span></div><button onClick={onTraining} className="ff3HeroButton"><Play size={19} fill="currentColor"/>{active?'Training fortsetzen':'Zum Training'}<ArrowUpRight size={21}/></button></article>
 <article className="ff3Panel"><div className="ff3PanelHead"><div><span className="ff3Kicker">DEIN RHYTHMUS</span><h2>Diese Woche</h2></div><strong className="ff3WeekNumber">{weekCount}<small> / {goal}</small></strong></div><div className="ff3Week">{['Mo','Di','Mi','Do','Fr','Sa','So'].map((d,i)=>{const date=shiftDate(monday,i),done=dates.has(date);return <div key={d}><small>{d}</small><span className={(done?'done ':'')+(date===today?'today':'')} aria-label={date+(done?' Training absolviert':'')}>{done?<Check size={17}/>:Number(date.slice(-2))}</span></div>})}</div><button className="ff3TextButton" onClick={onProgress}><CalendarCheck2 size={17}/> Persönlichen Fortschritt ansehen<ChevronRight size={16}/></button></article>
 <article className="ff3Panel"><div className="ff3PanelHead"><div><span className="ff3Kicker">HEUTE</span><h2>Deine Ernährung</h2></div><Utensils size={23}/></div><NutritionMeters sum={nutrition} goals={goals}/><button className="ff3TextButton" onClick={onNutrition}>Zum Ernährungstagebuch <ChevronRight size={16}/></button></article>
 <article className="ff3Panel ff3ProfilePanel"><div><span className="ff3Kicker">DEIN FOKUS</span><h2>{profile.title}</h2><p>{isMaintenance(owner)?'Kraft erhalten, Ausdauer verbessern und dich wohlfühlen.':'Kraft und Muskelaufbau langfristig entwickeln.'}</p></div><button onClick={onPrograms} className="ff3TextButton">Programme ansehen <ChevronRight size={16}/></button></article>
 </section>
}
