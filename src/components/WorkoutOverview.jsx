import React from 'react'
import { ArrowUpRight, CalendarCheck2, ChevronRight, Clock3, HeartHandshake, ListChecks, Play, Target, Zap } from 'lucide-react'
import { FigureFrame, MOVES, animationFor } from './ExerciseFigure'
import { imageFor } from '../lib/plans'
import { prefersVideo } from '../lib/exerciseVideos'
import { comebackOf, estimateMinutes, isLoggable, lastEntry } from '../lib/logStore'
import { dateKey } from './ProgressCalendar'
import { supersetLabel } from '../lib/superset'
import { goalFor, isMaintenance } from '../lib/fitnessGoals'

function Thumb({ step, imagePerson }) {
  if (prefersVideo(step)) return <span className="ovThumb"><span className="ffDemoThumb"><Play size={22}/></span></span>
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

const categoryOf = (type) => ({
  upper: 'Oberkörper', lower: 'Beine', core: 'Core', warmup: 'Warm-up',
  cardio: 'Cardio', recovery: 'Erholung',
}[type] || 'Training')

export default function WorkoutOverview({ programKey, plan, day, dayIndex, steps, imagePerson, owner, log, history, pauseSeconds, goal, weekCount, onStart, onOpenExercise }) {
  const minutes = estimateMinutes(steps, pauseSeconds)
  const lastSameDay = [...history].reverse().find((e) => e.programId === programKey && e.dayIndex === dayIndex)
  const strength = steps.filter(isLoggable).length
  const today = dateKey()
  const comebacks = steps.filter(isLoggable).map((s) => comebackOf(log, owner, s.name, today)).filter(Boolean)
  const restart = comebacks.filter((c) => c.kind === 'restart').sort((a, b) => b.gap - a.gap)[0]
  const ramping = !isMaintenance(owner) && !restart && comebacks.some((c) => c.kind === 'ramp')

  return (
    <div className="overview">
      <section className="ovHero">
        <div className="ovHeroTop">
          <span className="ovHeroTag"><Zap size={15} fill="currentColor" /> DEIN WORKOUT</span>
          <span className="ovHeroTag secondary">{goalFor(owner,programKey).title}</span>
        </div>
        <div className="ovHeroTitle">
          <p className="ovHeroPre">{plan.name} / {dayIndex + 1 < 10 ? '0' : ''}{dayIndex + 1}</p>
          <h2>{day.title}</h2>
          <p className="ovHeroFocus">{day.focus}</p>
        </div>
        <div className="ovHeroStats">
          <span><Clock3 size={17} /> <strong>ca. {minutes} Min</strong></span>
          <span><ListChecks size={17} /> <strong>{steps.length} Übungen</strong></span>
          {goal > 0 && <span><Target size={17} /> <strong>{Math.min(weekCount, goal)} / {goal} Woche</strong></span>}
        </div>
        <button className="primaryAction big ovStart" onClick={onStart}>
          <span className="ovStartIcon"><Play size={18} fill="currentColor" /></span>
          Training starten
          <ArrowUpRight className="ovStartArrow" size={19} />
        </button>
        {day.tone && <p className="ovHeroTone">{day.tone}</p>}
      </section>

      {lastSameDay && (
        <p className="ovLast"><CalendarCheck2 size={15} /> Diese Einheit zuletzt {daysAgo(lastSameDay.date)}</p>
      )}
      {restart && (
        <div className="comebackBanner" role="status">
          <HeartHandshake size={20} />
          <p>
            <strong>Willkommen zurück!</strong>
            <span>{restart.gap} Tage Pause erkannt – die Vorschläge starten heute bei ca. {Math.round(restart.factor * 100)} %. {isMaintenance(owner) ? 'Trainiere ohne Steigerungsdruck.' : 'Sie steigen in den nächsten Einheiten wieder zu deinem alten Niveau.'}</span>
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

      <div className="ovSectionHead">
        <div>
          <span className="ovSectionKicker">DEIN FAHRPLAN</span>
          <h3>Heute auf dem Plan <small>{steps.length}</small></h3>
        </div>
        <span className="ovSectionHint">Antippen für Details</span>
      </div>

      <ol className="ovList">
        {steps.map((step, i) => {
          const last = isLoggable(step) ? lastEntry(log, owner, step.name) : null
          const top = last ? Math.max(...last.sets.map((s) => s.w)) : 0
          const ss = supersetLabel(steps, i)
          return (
            <li key={`${step.name}-${i}`}>
              <button onClick={() => onOpenExercise(i)} aria-label={`${step.name}: Anleitung und letzte Ergebnisse ansehen`}>
                <span className="ovStepNumber">{String(i + 1).padStart(2, '0')}</span>
                <Thumb step={step} imagePerson={imagePerson} />
                <span className="ovCopy">
                  <span className="ovType">{categoryOf(step.type)}</span>
                  <strong>{step.name}{ss ? <em className="ssTag" title="Supersatz">{ss.letter}{ss.pos}</em> : null}</strong>
                  <small>{step.reps}{last ? ` · Zuletzt ${top > 0 ? `${String(top).replace('.', ',')} kg` : `${Math.max(...last.sets.map((s) => s.r))} Wdh.`}` : ''}</small>
                </span>
                <ChevronRight className="ovArrow" size={20} aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ol>
      {strength > 0 && <p className="ovFoot">Deine Gewichte und Wiederholungen bleiben gespeichert. FitFlow zeigt dir deine bisherigen Leistungen beim nächsten Training.</p>}
    </div>
  )
}
