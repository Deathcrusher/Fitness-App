import React, { useState } from 'react'
import ExerciseFigure from './ExerciseFigure'
import ExerciseDemo from './ExerciseDemo'
import { exerciseVideoFor, prefersVideo } from '../lib/exerciseVideos'

export default function SessionMedia(props) {
  return <SessionMediaContent key={props.stepKey} {...props}/>
}
function SessionMediaContent({phase,step,stepKey,imageMode,onImageMode,image,imageFocus,guide,hasAnim,badge}){
 const video=exerciseVideoFor(step), [videoMode,setVideoMode]=useState(()=>prefersVideo(step))
 const showVideo=Boolean(phase==='work'&&video&&videoMode)
 const active=showVideo?'video':imageMode==='anim'&&!hasAnim||imageMode==='guide'&&!guide?'photo':imageMode
 const modes=[...(hasAnim?[['anim','Animation']]:[]),...(video?[['video','Video']]:[]),...(guide?[['guide','Start / Ende']]:[]),['photo','Foto']]
 function choose(mode){setVideoMode(mode==='video');if(mode!=='video')onImageMode(mode)}
 return <div className="ffLiveMedia">
  {showVideo?<ExerciseDemo key={stepKey} step={step}/>:<div className={`sessionImageWrap${phase==='rest'?' resting':''}`}>
   {phase==='work'&&hasAnim&&active==='anim'?<ExerciseFigure key={stepKey} step={step} label={step.name+': Bewegungsablauf'}/>:<img className={active==='guide'&&guide?'guideImage':''} src={active==='guide'&&guide?guide:image} alt={active==='guide'&&guide?step.name+': Start- und Endposition':step.name+' Foto'} style={{objectPosition:active==='guide'&&guide?'center center':imageFocus}} loading="lazy" decoding="async"/>}
   {phase==='work'&&active==='guide'&&guide&&<><span className="guidePosition start">Start</span><span className="guidePosition end">Ende</span></>}
   {badge&&<div className="phaseBadge">{badge}</div>}
  </div>}
  {phase==='work'&&modes.length>1&&<div className="ffLiveMediaTabs" role="group" aria-label="Übungsdarstellung">{modes.map(([key,label])=><button key={key} type="button" aria-pressed={active===key} className={active===key?'active':''} onClick={()=>choose(key)}>{label}</button>)}</div>}
 </div>
}
