import React from 'react'
import { Timer,Layers,Settings,ChevronRight } from 'lucide-react'
export default function MoreStudio({onTimer,onPrograms,onSettings,active}){
 return <section className="ff3Page"><div className="ff3SectionTitle"><div><span className="ff3Kicker">FITFLOW STUDIO</span><h1>Mehr.</h1><p>Alles rund um dein Training.</p></div></div><div className="ff3Panel ff3More">{[[Timer,'Timer','Freier Trainings- und Pausentimer',onTimer,false],[Layers,'Programme','Programme erstellen und bearbeiten',onPrograms,active],[Settings,'Einstellungen','Design, Cloud, Backup & Erinnerungen',onSettings,false]].map(([Icon,title,desc,onClick,disabled])=><button key={title} onClick={onClick} disabled={disabled}><Icon size={22}/><span><strong>{title}</strong><small>{desc}</small></span><ChevronRight size={18}/></button>)}</div>{active&&<p className="ff3Note">Beende oder setze dein aktuelles Training zurück, bevor du Programme wechselst.</p>}</section>
}
