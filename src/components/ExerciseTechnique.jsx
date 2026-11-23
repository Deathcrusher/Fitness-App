import React from 'react'
import { AlertCircle, CheckCircle2, Footprints, Lightbulb } from 'lucide-react'

const guides = [
  {
    match: /wadenheben|calf[ -]?raise/i,
    title: 'Wadenheben – ganz einfach',
    note: 'Du brauchst anfangs keine Hanteln. Eine Wand oder Stuhllehne zum Festhalten reicht.',
    steps: [
      ['START', 'Aufrecht stehen, Füße hüftbreit, ganze Fußsohlen am Boden.'],
      ['HOCH', 'Fersen langsam heben, bis du auf den Fußballen stehst. Eine Sekunde halten.'],
      ['RUNTER', 'Fersen kontrolliert wieder absetzen. Ohne Federn oder Schwung.'],
    ],
    warning: 'Du solltest die Waden spüren. Halte Knie und Oberkörper ruhig.',
  },
  {
    match: /rumänische[snm]? kreuzheben|romanian deadlift/i,
    title: 'Rumänisches Kreuzheben – Hüftbeuge',
    note: 'Lerne die Bewegung zuerst ohne oder mit sehr leichten Hanteln.',
    steps: [
      ['START', 'Füße hüftbreit, Knie leicht gebeugt. Hanteln nah vor den Oberschenkeln.'],
      ['ZURÜCK', 'Schieb den Po nach hinten, halte den Rücken neutral. Hanteln bleiben nah an den Beinen.'],
      ['HOCH', 'Drück die Füße in den Boden und richte die Hüfte wieder auf.'],
    ],
    warning: 'Nicht mit rundem Rücken nach unten ziehen. Stoppe die Bewegung, sobald die Rückenposition verloren geht.',
  },
]

export default function ExerciseTechnique({ step, compact = false }) {
  const guide = guides.find((item) => item.match.test(step?.name || ''))
  if (!guide) return null
  return (
    <section className={`ffTechnique${compact ? ' compact' : ''}`} aria-label={`Technikanleitung: ${step.name}`}>
      <div className="ffTechniqueHead">
        <span className="ffTechniqueIcon"><Footprints size={18} /></span>
        <div>
          <span className="ffTechniqueEyebrow">SCHRITT FÜR SCHRITT</span>
          <h4>{guide.title}</h4>
        </div>
      </div>
      <p className="ffTechniqueIntro"><Lightbulb size={16} /> {guide.note}</p>
      <ol className="ffTechniqueSteps">
        {guide.steps.map(([title, detail], index) => (
          <li key={title}>
            <span className="ffTechniqueNumber">0{index + 1}</span>
            <div><strong>{title}</strong><p>{detail}</p></div>
            {index === guide.steps.length - 1 && <CheckCircle2 size={17} className="ffTechniqueDone" />}
          </li>
        ))}
      </ol>
      <p className="ffTechniqueTip"><AlertCircle size={16} /> {guide.warning}</p>
    </section>
  )
}
