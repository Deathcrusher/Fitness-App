import React from 'react'
import { CalendarCheck2, Clock3, ListChecks, Play, Target } from 'lucide-react'
import { FigureFrame, MOVES, animationFor } from './ExerciseFigure'
import { imageFor } from '../lib/plans'
import { estimateMinutes, isLoggable, lastEntry } from '../lib/logStore'

function Thumb({ step, imagePerson }) {
  const key = animationFor(step)
  if (key) {
    const def = MOVES[key]
    const t = (def.keys[0].hold || 0) + def.keys[0].dur
    return <span className="ovThumb"><FigureFrame moveKey={key} time={t} showCue={false} label="" /></span>
  }
  return <span className="ovThumb"><img src={imageFor(step, imagePerson)} alt="" loading="lazy" decoding="async" /></span>
}

function daysAgo(dateStr) {
  const then = new Date(`${dateStr}T12:00:00`)
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  const diff = Math.round((now - then) / 86400000)
  if (diff <= 0) return 'heute'
  if (diff === 1) return 'gestern'
  return `vor ${diff} Tagen`
}

export default function WorkoutOverview({ programKey, plan, day, dayIndex, steps, imagePerson, owner, log, history, pauseSeconds, goal, weekCount, onStart, onOpenExercise }) {
  const minutes = estimateMinutes(steps, pauseSeconds)
  const lastSameDay = [...history].reverse().find((e) => e.programId === programKey && e.dayIndex === dayIndex)
  const strength = steps.filter(isLoggable).length

  return (
    <div className="overview">
      <div className="ovHead">
        <h2>{day.title}</h2>
        <p>{day.focus}</p>
      </div>
      <div className="ovMeta">
        <span><Clock3 size={15} /> ca. {minutes} Min</span>
        <span><ListChecks size={15} /> {steps.length} Übungen</span>
        {goal > 0 && <span className={weekCount >= goal ? 'met' : ''}><Target size={15} /> Woche {Math.min(weekCount, goal)}/{goal}</span>}
      </div>
      {day.tone && <p className="ovTone">{day.tone}</p>}
      {lastSameDay && (
        <p className="ovLast"><CalendarCheck2 size={15} /> Zuletzt gemacht {daysAgo(lastSameDay.date)}</p>
      )}

      <button className="primaryAction big ovStart" onClick={onStart}>
        <Play size={22} /> Training starten
      </button>

      <ol className="ovList">
        {steps.map((step, i) => {
          const last = isLoggable(step) ? lastEntry(log, owner, step.name) : null
          const top = last ? Math.max(...last.sets.map((s) => s.w)) : 0
          return (
            <li key={`${step.name}-${i}`}>
              <button onClick={() => onOpenExercise(i)}>
                <Thumb step={step} imagePerson={imagePerson} />
                <span className="ovCopy">
                  <strong>{step.name}</strong>
                  <small>{step.reps}{last ? ` · zuletzt ${top > 0 ? `${String(top).replace('.', ',')} kg` : `${Math.max(...last.sets.map((s) => s.r))} Wdh.`}` : ''}</small>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      {strength > 0 && <p className="ovFoot">Bei {strength} Kraftübungen trägst du Gewicht und Wiederholungen ein – die App schlägt dir dann vor, wann du steigern kannst.</p>}
    </div>
  )
}
