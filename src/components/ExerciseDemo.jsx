import React,{useState} from 'react'
import { Play, ExternalLink } from 'lucide-react'
import { exerciseVideoFor, videoWatchUrl, videoEmbedUrl } from '../lib/exerciseVideos'
import './exerciseDemo.css'

export default function ExerciseDemo({step}) {
 const [loaded,setLoaded]=useState(false)
 const video=exerciseVideoFor(step)
 if(!video) return null
 return <section className="ffExerciseDemo" aria-label={step.name+': Videoanleitung'}>
   <div className="ffDemoHead"><strong>VIDEO-ANLEITUNG</strong><span>{video.author}</span></div>
   <div className="ffDemoFrame">
     {loaded ? <iframe title={step.name+' – '+video.title} src={videoEmbedUrl(video)} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/> :
       <button className="ffDemoPlay" type="button" onClick={()=>setLoaded(true)}><span><Play size={30} fill="currentColor"/></span><strong>Übung ansehen</strong><small>Originalvideo auf YouTube · Internet erforderlich</small></button>}
   </div>
   <p className="ffDemoNote">{video.note}</p>
   <div className="ffDemoFoot"><span>Dein FitFlow-Timer läuft unabhängig vom Video.</span><a href={videoWatchUrl(video)} target="_blank" rel="noopener noreferrer">Auf YouTube öffnen <ExternalLink size={13}/></a></div>
   {loaded && <button type="button" className="ghostBtn subtle" onClick={()=>setLoaded(false)}>Video schließen</button>}
 </section>
}
