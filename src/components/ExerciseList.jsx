import React from 'react'
import { CheckCircle2, ChevronRight, Video } from 'lucide-react'
import { TYPE_META } from '../lib/plans'

export default function ExerciseList({ plan, day, steps, progress, stepIndex, phase, doneSteps, hasVideo, onPick, onInfo }) {
  return (
    <aside className="planPanel">
      <div className="panelHead">
        <div>
          <p className="muted">{plan.equipment}</p>
          <h2>{day.focus}</h2>
        </div>
        <span>{progress}%</span>
      </div>
      <p className="dayTone">{day.tone}</p>
      <div className="stepList">
        {steps.map((item, index) => {
          const ItemIcon = TYPE_META[item.type].icon
          const state = index === stepIndex && phase !== 'done' ? 'current' : doneSteps[index] ? 'done' : ''
          const linked = hasVideo(item)
          return (
            <div key={`${item.name}-${index}`} className={`stepRow ${state}`}>
              <button className="stepMain" onClick={() => onPick(index)}>
                <span className="stepIcon">{state === 'done' ? <CheckCircle2 size={18} /> : <ItemIcon size={18} />}</span>
                <span className="stepCopy"><strong>{item.name}</strong><small>{item.reps}</small></span>
                {linked && <Video size={15} className="stepVideoIcon" />}
              </button>
              <button className="stepInfo" onClick={() => onInfo(index)} aria-label={`${item.name}: Details und Verlauf`}>
                <ChevronRight size={18} />
              </button>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
