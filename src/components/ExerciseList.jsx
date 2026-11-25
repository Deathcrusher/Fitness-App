import React from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, ChevronRight, Video, GripVertical, Play } from 'lucide-react'
import { TYPE_META } from '../lib/plans'
import { supersetLabel } from '../lib/superset'
import { orderBlocks } from '../lib/sessionOrder'
import { useExerciseDrag } from './useExerciseDrag'

export default function ExerciseList({plan,day,steps,progress,stepIndex,phase,doneSteps,hasVideo,onPick,onInfo,activeWorkout=false,sessionLog={},onMove,onResume}){
 const blocks=orderBlocks(steps,stepIndex,doneSteps,sessionLog)
 const {root,drag}=useExerciseDrag(blocks,activeWorkout,onMove)
 const source=drag&&blocks.find(b=>b.start===drag.source)
 const keyboardMove=(e,block)=>{
  if(!activeWorkout||block.locked||!e.altKey||!['ArrowUp','ArrowDown'].includes(e.key))return
  e.preventDefault();onMove(block.start,e.key==='ArrowUp'?-1:1)
 }
 function shift(block){
  if(!drag||block.start===drag.source)return 0
  if(drag.target>drag.source&&block.start>drag.source&&block.start<=drag.target)return -drag.height
  if(drag.target<drag.source&&block.start>=drag.target&&block.start<drag.source)return drag.height
  return 0
 }
 return <aside className="planPanel ffOrderPanel">
  <div className="panelHead"><div><p className="muted">{plan.equipment}</p><h2>{day.focus}</h2></div><span>{progress}%</span></div>
  <p className="dayTone">{day.tone}</p>
  {activeWorkout&&<p className="ffDragHint"><GripVertical size={16}/> Übung halten &amp; verschieben <span>· Nur diese Einheit</span></p>}
  <div className={'stepList ffDragList'+(drag?' dragging':'')} ref={root}>
   {blocks.map(block=>{
    const movable=activeWorkout&&!block.locked,group=block.end>block.start
    return <div key={steps.slice(block.start,block.end+1).map(s=>s.name).join('|')+'-'+block.start} data-order-start={block.start} className={'ffOrderBlock ffDragBlock'+(movable?' movable':'')+(group?' grouped':'')+(drag?.source===block.start?' lifted':'')}>
     <div className="ffDragInner" style={{transform:shift(block)?'translateY('+shift(block)+'px)':undefined}}>
      {steps.slice(block.start,block.end+1).map((item,offset)=>{
       const index=block.start+offset,ItemIcon=TYPE_META[item.type].icon
       const state=index===stepIndex&&phase!=='done'?'current':doneSteps[index]?'done':'',ss=supersetLabel(steps,index)
       return <div key={item.name+'-'+index} className={`stepRow ${state}`}>
        <button className="stepMain" onClick={()=>onPick(index)} onKeyDown={e=>keyboardMove(e,block)} aria-label={movable?item.name+' · Halten zum Verschieben, Alt und Pfeiltasten zum Sortieren':undefined}>
         <span className="stepIcon">{state==='done'?<CheckCircle2 size={18}/>:<ItemIcon size={18}/>}</span>
         <span className="stepCopy"><strong>{item.name}{ss&&<em className="ssTag" title="Supersatz">{ss.letter}{ss.pos}</em>}</strong><small>{item.reps}{activeWorkout&&state==='current'?' · Aktuell':doneSteps[index]==='skipped'?' · Übersprungen':''}</small></span>
         <span className="ffDragRowIcons">{hasVideo(item)&&<Video size={15} className="stepVideoIcon"/>}
         {movable&&offset===0&&<GripVertical className="ffDragGrip" size={17} aria-hidden="true"/>}</span>
        </button>
        <button className="stepInfo" onClick={()=>onInfo(index)} aria-label={item.name+': Details und Verlauf'}><ChevronRight size={18}/></button>
       </div>
      })}
     </div>
    </div>
   })}
  </div>
  {activeWorkout&&<button className="ff3Primary ffOrderResume" onClick={onResume}><Play size={18}/> Training fortsetzen</button>}
  {drag&&source&&typeof document!=='undefined'&&createPortal(<div className="ffDragGhost" aria-hidden="true" style={{top:drag.top,left:drag.left,width:drag.width,minHeight:drag.height}}>
   {steps.slice(source.start,source.end+1).map((item,i)=>{const Icon=TYPE_META[item.type].icon;return <div className="ffDragGhostRow" key={i}><Icon size={20}/><div><strong>{item.name}</strong><small>{item.reps}</small></div><GripVertical size={19}/></div>})}
  </div>,document.body)}
 </aside>
}
