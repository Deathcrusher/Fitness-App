import React,{useEffect,useRef,useState} from 'react'
import {ChevronDown,Check,Lock} from 'lucide-react'
export default function ProfileSwitcher({owner,entries,disabled,onChange}){
 const [open,setOpen]=useState(false),root=useRef(null)
 useEffect(()=>{if(!open)return;const close=e=>{if(!root.current?.contains(e.target))setOpen(false)};const key=e=>{if(e.key==='Escape')setOpen(false)};document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key)}},[open])
 const name=entries.find(([id])=>id===owner)?.[1]?.name||owner
 return <div className="ffProfileSwitch" ref={root}><button className="ffProfileTrigger" type="button" disabled={disabled} aria-expanded={open&&!disabled} aria-label={'Profil: '+name+(disabled?' – während des Trainings gesperrt':' wechseln')} onClick={()=>setOpen(v=>!v)}><span className={'ffProfileAvatar '+owner}>{name.slice(0,1)}</span><span className="ffProfileName">{name}</span>{disabled?<Lock size={13}/>:<ChevronDown size={15}/>}</button>
 {open&&!disabled&&<div className="ffProfileMenu" role="group" aria-label="Profil auswählen"><small>TRAININGSPROFIL</small>{entries.map(([id,item])=><button key={id} type="button" aria-pressed={owner===id} onClick={()=>{onChange(id);setOpen(false)}}><span className={'ffProfileAvatar '+id}>{item.name.slice(0,1)}</span><span><strong>{item.name}</strong><small>{id==='rene'?'Muskelaufbau':'Fit & Straff'}</small></span>{owner===id&&<Check size={19}/>}</button>)}</div>}</div>
}
