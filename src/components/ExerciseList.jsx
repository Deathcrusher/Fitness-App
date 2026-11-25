import React from 'react'
import { CheckCircle2, ChevronRight, Video, ArrowUp, ArrowDown, ArrowUpToLine, Lock, ListOrdered, Play } from 'lucide-react'
import { TYPE_META } from '../lib/plans'
import { supersetLabel } from '../lib/superset'
import { orderBlocks } from '../lib/sessionOrder'

export default function ExerciseList({ plan, day, steps, progress, stepIndex, phase, doneSteps, hasVideo, onPick, onInfo, activeWorkout=false, sessionLog={}, onMove, onResume }) {
  const blocks=orderBlocks(steps,stepIndex,doneSteps,sessionLog)
  return (
    <aside className="planPanel ffOrderPanel">
      <div className="panelHead">
        <div><p className="muted">{plan.equipment}</p><h2>{day.focus}</h2></div>
        <span>{progress}%</span>
      </div>
      <p className="dayTone">{day.tone}</p>
      {activeWorkout&&<div className="ffOrderIntro"><ListOrdered size={22}/><div><strong>Reihenfolge für dieses Training</strong><p>Offene Übungen mit den Pfeilen verschieben. Der laufende Satz und bisherige Leistungen bleiben erhalten. Supersätze bleiben zusammen.</p></div></div>}
      <div className="stepList">
        {blocks.map((block,bi)=>{
          const canUp=activeWorkout&&!block.locked&&bi>0&&!blocks[bi-1].locked
          const canDown=activeWorkout&&!block.locked&&bi<blocks.length-1&&!blocks[bi+1].locked
          const group=block.end>block.start
          return <div key={steps.slice(block.start,block.end+1).map(s=>s.name).join('|')+'-'+block.start} className={'ffOrderBlock'+(activeWorkout&&group?' grouped':'')}>
            {steps.slice(block.start,block.end+1).map((item,offset)=>{
              const index=block.start+offset
              const ItemIcon=TYPE_META[item.type].icon
              const state=index===stepIndex&&phase!=='done'?'current':doneSteps[index]?'done':''
              const ss=supersetLabel(steps,index)
              return <div key={item.name+'-'+index} className={`stepRow ${state}`}>
                <button className="stepMain" onClick={()=>onPick(index)}>
                  <span className="stepIcon">{state==='done'?<CheckCircle2 size={18}/>:<ItemIcon size={18}/>}</span>
                  <span className="stepCopy"><strong>{item.name}{ss&&<em className="ssTag" title="Supersatz">{ss.letter}{ss.pos}</em>}</strong><small>{item.reps}{activeWorkout&&state==='current'?' · Aktuell':doneSteps[index]==='skipped'?' · Übersprungen':''}</small></span>
                  {hasVideo(item)&&<Video size={15} className="stepVideoIcon"/>}
                </button>
                <button className="stepInfo" onClick={()=>onInfo(index)} aria-label={item.name+': Details und Verlauf'}><ChevronRight size={18}/></button>
              </div>
            })}
            {activeWorkout&&<div className="ffOrderControls">
              {block.locked?<span className="ffOrderLocked"><Lock size={13}/> {group?'Supersatz · ':''}Fixiert</span>:<>
                <span>{group?'Supersatz verschieben':'Übung verschieben'}</span>
                <button type="button" disabled={!canUp} onClick={()=>onMove(block.start,'next')} aria-label={steps[block.start].name+' als nächste offene Übung'} title="An erste offene Position"><ArrowUpToLine size={17}/></button>
                <button type="button" disabled={!canUp} onClick={()=>onMove(block.start,-1)} aria-label={steps[block.start].name+' nach oben'}><ArrowUp size={17}/></button>
                <button type="button" disabled={!canDown} onClick={()=>onMove(block.start,1)} aria-label={steps[block.start].name+' nach unten'}><ArrowDown size={17}/></button>
              </>}
            </div>}
          </div>
        })}
      </div>
      {activeWorkout&&<button className="ff3Primary ffOrderResume" onClick={onResume}><Play size={18}/> Training fortsetzen</button>}
    </aside>
  )
}
