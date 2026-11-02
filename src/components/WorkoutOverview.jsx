import React from 'react'
import { CalendarCheck2, Clock3, HeartHandshake, ListChecks, Play, Target } from 'lucide-react'
import { FigureFrame, MOVES, animationFor } from './ExerciseFigure'
import { imageFor } from '../lib/plans'
import { comebackOf, estimateMinutes, isLoggable, lastEntry } from '../lib/logStore'
import { dateKey } from './ProgressCalendar'
import { supersetLabel } from '../lib/superset'

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
  const today = dateKey()
  const comebacks = steps.filter(isLoggable).map((s) => comebackOf(log, owner, s.name, today)).filter(Boolean)
  const restart = comebacks.filter((c) => c.kind === 'restart').sort((a, b) => b.gap - a.gap)[0]
  const ramping = !restart && comebacks.some((c) => c.kind === 'ramp')

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

      {restart && (
        <div className="comebackBanner" role="status">
          <HeartHandshake size={20} />
          <p>
            <strong>Willkommen zurück!</strong>
            <span>{restart.gap} Tage Pause erkannt – die Vorschläge starten heute bei ca. {Math.round(restart.factor * 100)} % und steigern sich in den nächsten Einheiten wieder zu deinem alten Niveau.</span>
          </p>
        </div>
      )}
      {ramping && (
        <div className="comebackBanner ramp" role="status">
          <HeartHandshake size={20} />
          <p>
            <strong>Comeback läuft</strong>
            <span>Die Vorschläge führen dich in größeren Schritten zurück zu deinen Werten vor der Pause.</span>
          </p>
        </div>
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
                  <strong>{step.name}{(() => { const ss = supersetLabel(steps, i); return ss ? <em className="ssTag" title="Supersatz">{ss.letter}{ss.pos}</em> : null })()}</strong>
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
