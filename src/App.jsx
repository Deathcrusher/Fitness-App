import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Bike,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  TimerReset,
  Trophy,
} from 'lucide-react'

const VISUALS = {
  warmup: '/assets/warmup.svg',
  lower: '/assets/lower.svg',
  upper: '/assets/upper.svg',
  core: '/assets/core.svg',
  cardio: '/assets/cardio.svg',
  recovery: '/assets/recovery.svg',
}

const TYPE_META = {
  warmup: { label: 'Warm-up', icon: Footprints },
  lower: { label: 'Beine & Po', icon: Flame },
  upper: { label: 'Kraft', icon: Dumbbell },
  core: { label: 'Core', icon: Activity },
  cardio: { label: 'Cardio', icon: Bike },
  recovery: { label: 'Cooldown', icon: HeartPulse },
}

const plans = {
  connie: {
    name: 'Connie',
    title: 'Straffen & wohlfühlen',
    accent: 'coral',
    equipment: 'Hanteln, Matte, Hula Hoop, Hometrainer',
    days: [
      {
        title: 'Montag',
        focus: 'Ganzkörper + Cardio',
        tone: 'Kalorien verbrennen und Körperspannung aufbauen.',
        steps: [
          step('warmup', 'Warm-up', 'Locker starten: marschieren, Arme kreisen, Knie heben, Fersen zum Po.', 480, 0, '5-10 Min'),
          step('lower', 'Kniebeugen', 'Brust aufrecht, Knie leicht nach außen, kontrolliert tief gehen.', 45, 50, '3 x 15'),
          step('lower', 'Ausfallschritte', 'Pro Bein sauber arbeiten, Oberkörper bleibt ruhig.', 45, 50, '3 x 12 je Bein'),
          step('upper', 'Rudern mit Hanteln', 'Rücken gerade, Ellbogen eng am Koerper ziehen.', 45, 50, '3 x 12'),
          step('upper', 'Schulterdrücken', 'Bauch fest, Hanteln kontrolliert nach oben drücken.', 45, 50, '3 x 12'),
          step('lower', 'Glute Bridge', 'Po oben kurz anspannen und langsam absenken.', 45, 50, '3 x 15'),
          step('core', 'Plank', 'Rücken lang, Bauch fest, Nacken entspannt.', 40, 30, '3 x 30-45 Sek'),
          step('cardio', 'Cardio Finish', 'Hometrainer moderat fahren, gleichmäßig atmen.', 1200, 0, '20 Min'),
        ],
      },
      {
        title: 'Mittwoch',
        focus: 'Cardio & Core',
        tone: 'Ausdauer, Bauchspannung und lockerer Rhythmus.',
        steps: [
          step('warmup', 'Warm-up', 'Gelenke vorbereiten und entspannt in Bewegung kommen.', 420, 0, '5-10 Min'),
          step('cardio', 'Hula Hoop', 'Gleichmaessiges Tempo, locker bleiben und dranbleiben.', 1800, 60, '30 Min'),
          step('core', 'Plank', 'Ruhig halten und gleichmäßig atmen.', 40, 30, '3 x 30-45 Sek'),
          step('core', 'Russian Twists', 'Oberkörper drehen, Core bleibt aktiv.', 45, 30, '3 x 20'),
          step('core', 'Bicycle Crunches', 'Langsam und sauber, nicht am Nacken ziehen.', 45, 30, '3 x 20'),
          step('core', 'Beinheben', 'Rücken bleibt am Boden, Bewegung kontrollieren.', 45, 30, '3 x 15'),
          step('cardio', 'Ausfahren', 'Hometrainer locker ausfahren und Puls senken.', 900, 0, '15 Min'),
        ],
      },
      {
        title: 'Freitag',
        focus: 'Ganzkörper + Hula Hoop',
        tone: 'Po, Beine, Oberkörper und ein leichter Abschluss.',
        steps: [
          step('warmup', 'Warm-up', 'Locker starten und Atmung finden.', 480, 0, '5-10 Min'),
          step('lower', 'Kniebeugen', 'Sauber, ruhig und kontrolliert arbeiten.', 45, 50, '3 x 15'),
          step('lower', 'Rumänisches Kreuzheben', 'Hüfte nach hinten, Rücken lang lassen.', 45, 50, '3 x 12'),
          step('upper', 'Brustdrücken am Boden', 'Hanteln kontrolliert nach oben drücken.', 45, 50, '3 x 12'),
          step('upper', 'Rudern mit Hanteln', 'Schulterblätter bewusst zusammenziehen.', 45, 50, '3 x 12'),
          step('upper', 'Seitheben', 'Leichtes Gewicht, ohne Schwung.', 45, 50, '3 x 15'),
          step('lower', 'Glute Bridge', 'Po oben aktiv anspannen.', 45, 50, '3 x 15'),
          step('cardio', 'Hula Hoop Finish', 'Locker, gleichmäßig und mit Spaß abschliessen.', 1200, 0, '20 Min'),
        ],
      },
    ],
  },
  rene: {
    name: 'René',
    title: 'Kraft & Ausdauer',
    accent: 'green',
    equipment: 'Hanteln, Matte, Laufband',
    days: [
      {
        title: 'Montag',
        focus: 'Ganzkörper A',
        tone: 'Basis-Kraft sauber aufbauen.',
        steps: [
          step('warmup', 'Aufwärmen', 'Marschieren, Arme kreisen, Knie heben, leichte Kniebeugen.', 480, 0, '5-10 Min'),
          step('lower', 'Kniebeugen', 'Optional mit Hanteln, kontrolliert tief gehen.', 45, 75, '3 x 10'),
          step('upper', 'Rudern', 'Rücken gerade, Hanteln zum Koerper ziehen.', 45, 75, '3 x 10'),
          step('upper', 'Brustdrücken am Boden', 'Saubere Wiederholungen, Schulterblätter stabil.', 45, 75, '3 x 10'),
          step('upper', 'Schulterdrücken', 'Bauch fest, nicht ins Hohlkreuz fallen.', 45, 75, '3 x 8-10'),
          step('upper', 'Bizeps-Curls', 'Ellbogen ruhig halten, langsam senken.', 40, 60, '2 x 12'),
          step('core', 'Plank', 'Spannung halten und ruhig atmen.', 30, 45, '2 x 30 Sek'),
        ],
      },
      {
        title: 'Mittwoch',
        focus: 'Ganzkörper B',
        tone: 'Variation, Technik und stabiler Rumpf.',
        steps: [
          step('warmup', 'Aufwärmen', 'Locker starten, Gelenke vorbereiten.', 480, 0, '5-10 Min'),
          step('lower', 'Ausfallschritte', 'Pro Bein kontrolliert arbeiten.', 45, 75, '2-3 x 8 je Bein'),
          step('upper', 'Einarmiges Rudern', 'Abstützen, Rücken gerade, sauber ziehen.', 45, 75, '2-3 x 10 je Seite'),
          step('upper', 'Liegestütze', 'Auf Knien möglich, Rumpf bleibt fest.', 45, 75, '2-3 x 8-12'),
          step('upper', 'Seitheben', 'Langsam und ohne Schwung.', 40, 60, '2 x 10-12'),
          step('upper', 'Hammer Curls', 'Kontrolliert curlen und langsam senken.', 40, 60, '2 x 10'),
          step('core', 'Russian Twists', 'Bauch fest, 10 Drehungen pro Seite.', 45, 45, '2 x 20'),
        ],
      },
      {
        title: 'Freitag',
        focus: 'Ganzkörper + Laufband',
        tone: 'Wiederholen, steigern und locker auslaufen.',
        steps: [
          step('warmup', 'Mobilisieren', 'Kurz mobilisieren und warm werden.', 420, 0, '5-10 Min'),
          step('upper', 'Ganzkörper A Runde', 'Montag wiederholen: sauberer oder minimal mehr Wiederholungen.', 2100, 60, 'ca. 35 Min'),
          step('cardio', 'Laufband Gehen', '5 Min langsam, danach zügig gehen. Nicht rennen.', 900, 0, '10-15 Min'),
          step('recovery', 'Cooldown', 'Kurz dehnen, Wasser trinken und Puls senken.', 300, 0, '5 Min'),
        ],
      },
    ],
  },
}

function step(type, name, detail, work, rest, reps) {
  return { type, name, detail, work, rest, reps }
}

function fmt(seconds) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function minutesFor(steps) {
  return Math.round(steps.reduce((total, item) => total + item.work + item.rest, 0) / 60)
}

export default function App() {
  const [person, setPerson] = useState('connie')
  const [dayIndex, setDayIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState('work')
  const [running, setRunning] = useState(false)

  const plan = plans[person]
  const day = plan.days[dayIndex]
  const steps = day.steps
  const currentStep = steps[stepIndex] || steps[steps.length - 1]
  const meta = TYPE_META[currentStep.type]
  const TypeIcon = meta.icon
  const [seconds, setSeconds] = useState(currentStep.work)

  const completedSteps = phase === 'done' ? steps.length : phase === 'rest' ? stepIndex + 1 : stepIndex
  const progress = Math.min(100, Math.round((completedSteps / steps.length) * 100))
  const totalMinutes = useMemo(() => minutesFor(steps), [steps])
  const phaseLabel = phase === 'done' ? 'Fertig' : phase === 'rest' ? 'Pause' : meta.label

  useEffect(() => {
    setDayIndex(0)
    setStepIndex(0)
    setPhase('work')
    setRunning(false)
  }, [person])

  useEffect(() => {
    setSeconds(phase === 'rest' ? currentStep.rest : phase === 'done' ? 0 : currentStep.work)
  }, [person, dayIndex, stepIndex, phase, currentStep.rest, currentStep.work])

  function selectDay(index) {
    setDayIndex(index)
    setStepIndex(0)
    setPhase('work')
    setRunning(false)
  }

  function selectStep(index) {
    setStepIndex(index)
    setPhase('work')
    setRunning(false)
  }

  function advance() {
    if (phase === 'work' && currentStep.rest > 0) {
      setPhase('rest')
      setRunning(true)
      return
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1)
      setPhase('work')
      setRunning(false)
      return
    }

    setPhase('done')
    setRunning(false)
  }

  useEffect(() => {
    if (!running || phase === 'done') return

    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value > 1) return value - 1
        window.clearInterval(timer)
        window.setTimeout(advance, 240)
        return 0
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [running, phase, stepIndex, dayIndex, person])

  function resetWorkout() {
    setStepIndex(0)
    setPhase('work')
    setRunning(false)
  }

  function resetTimer() {
    setPhase('work')
    setRunning(false)
    setSeconds(currentStep.work)
  }

  return (
    <main className={`app ${plan.accent}`}>
      <section className="hero" aria-label="Trainingsübersicht">
        <div className="heroCopy">
          <span className="eyebrow"><Sparkles size={16} /> FitFlow</span>
          <h1>Dein Training, Schritt für Schritt.</h1>
          <p>Klare Einheiten für zuhause, große Timer und schnelle Wechsel zwischen Connie und René.</p>
          <div className="quickStats" aria-label="Trainingsdaten">
            <span><CalendarDays size={16} /> 3 Tage</span>
            <span><Clock3 size={16} /> {totalMinutes} Min heute</span>
            <span><Dumbbell size={16} /> Zuhause</span>
          </div>
        </div>
        <img className="heroImage" src="/assets/hero.svg" alt="Helles Home-Workout mit Matte und Hanteln" />
      </section>

      <section className="switcher" aria-label="Programm wählen">
        {Object.entries(plans).map(([key, item]) => (
          <button key={key} className={person === key ? 'active' : ''} onClick={() => setPerson(key)}>
            <span className="avatar">{item.name.slice(0, 1)}</span>
            <span><strong>{item.name}</strong><small>{item.title}</small></span>
          </button>
        ))}
      </section>

      <section className="dayRail" aria-label="Trainingstag wählen">
        {plan.days.map((item, index) => (
          <button key={item.title} className={dayIndex === index ? 'active' : ''} onClick={() => selectDay(index)}>
            <strong>{item.title}</strong>
            <span>{item.focus}</span>
          </button>
        ))}
      </section>

      <section className="dashboard">
        <article className="sessionCard">
          {phase === 'done' ? (
            <div className="finishState">
              <Trophy size={76} />
              <h2>Training fertig</h2>
              <p>{day.title}: {day.focus}</p>
              <button className="primaryAction" onClick={resetWorkout}><RotateCcw size={20} /> Neu starten</button>
            </div>
          ) : (
            <>
              <div className="sessionImageWrap">
                <img src={VISUALS[currentStep.type]} alt={`${currentStep.name} Illustration`} />
                <div className="phaseBadge"><TypeIcon size={16} /> {phaseLabel}</div>
              </div>

              <div className="sessionHeader">
                <div>
                  <p className="muted">{day.title} · {day.focus}</p>
                  <h2>{currentStep.name}</h2>
                </div>
                <span className="repBadge">{currentStep.reps}</span>
              </div>

              <p className="exerciseText">{phase === 'rest' ? 'Kurz Luft holen, trinken und bereit machen.' : currentStep.detail}</p>

              <div className="timerPanel" aria-label="Timer">
                <TimerReset size={24} />
                <strong>{fmt(seconds)}</strong>
              </div>

              <div className="progressLine"><span style={{ width: `${progress}%` }} /></div>

              <div className="controls">
                <button className="primaryAction" onClick={() => setRunning(!running)}>
                  {running ? <Pause size={20} /> : <Play size={20} />}
                  {running ? 'Pause' : 'Start'}
                </button>
                <button onClick={advance}><SkipForward size={20} /> {phase === 'rest' ? 'Weiter' : 'Erledigt'}</button>
                <button className="iconAction" onClick={resetTimer} aria-label="Timer zuruecksetzen"><RotateCcw size={20} /></button>
              </div>
            </>
          )}
        </article>

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
              const state = index === stepIndex && phase !== 'done' ? 'current' : index < completedSteps ? 'done' : ''
              return (
                <button key={`${item.name}-${index}`} className={state} onClick={() => selectStep(index)}>
                  <span className="stepIcon">{state === 'done' ? <CheckCircle2 size={18} /> : <ItemIcon size={18} />}</span>
                  <span className="stepCopy"><strong>{item.name}</strong><small>{item.reps}</small></span>
                  <ChevronRight size={18} />
                </button>
              )
            })}
          </div>
        </aside>
      </section>
    </main>
  )
}
