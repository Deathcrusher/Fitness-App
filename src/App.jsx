import React, { useEffect, useState } from 'react'
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

const PAUSE_SECONDS = 60

const VISUALS = {
  warmup: '/assets/warmup.png',
  lower: '/assets/lower.png',
  upper: '/assets/upper.png',
  core: '/assets/core.png',
  cardio: '/assets/cardio.png',
  recovery: '/assets/recovery.png',
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
          step('warmup', 'Warm-up', 'Locker starten: marschieren, Arme kreisen, Knie heben, Fersen zum Po.', '5-10 Min'),
          step('lower', 'Kniebeugen', 'Brust aufrecht, Knie leicht nach außen, kontrolliert tief gehen.', '3 x 15'),
          step('lower', 'Ausfallschritte', 'Pro Bein sauber arbeiten, Oberkörper bleibt ruhig.', '3 x 12 je Bein'),
          step('upper', 'Rudern mit Hanteln', 'Rücken gerade, Ellbogen eng am Körper ziehen.', '3 x 12'),
          step('upper', 'Schulterdrücken', 'Bauch fest, Hanteln kontrolliert nach oben drücken.', '3 x 12'),
          step('lower', 'Glute Bridge', 'Po oben kurz anspannen und langsam absenken.', '3 x 15'),
          step('core', 'Plank', 'Rücken lang, Bauch fest, Nacken entspannt.', '3 x 30-45 Sek'),
          step('cardio', 'Cardio Finish', 'Hometrainer moderat fahren, gleichmäßig atmen.', '20 Min'),
        ],
      },
      {
        title: 'Mittwoch',
        focus: 'Cardio & Core',
        tone: 'Ausdauer, Bauchspannung und lockerer Rhythmus.',
        steps: [
          step('warmup', 'Warm-up', 'Gelenke vorbereiten und entspannt in Bewegung kommen.', '5-10 Min'),
          step('cardio', 'Hula Hoop', 'Gleichmäßiges Tempo, locker bleiben und dranbleiben.', '30 Min'),
          step('core', 'Plank', 'Ruhig halten und gleichmäßig atmen.', '3 x 30-45 Sek'),
          step('core', 'Russian Twists', 'Oberkörper drehen, Core bleibt aktiv.', '3 x 20'),
          step('core', 'Bicycle Crunches', 'Langsam und sauber, nicht am Nacken ziehen.', '3 x 20'),
          step('core', 'Beinheben', 'Rücken bleibt am Boden, Bewegung kontrollieren.', '3 x 15'),
          step('cardio', 'Ausfahren', 'Hometrainer locker ausfahren und Puls senken.', '15 Min'),
        ],
      },
      {
        title: 'Freitag',
        focus: 'Ganzkörper + Hula Hoop',
        tone: 'Po, Beine, Oberkörper und ein leichter Abschluss.',
        steps: [
          step('warmup', 'Warm-up', 'Locker starten und Atmung finden.', '5-10 Min'),
          step('lower', 'Kniebeugen', 'Sauber, ruhig und kontrolliert arbeiten.', '3 x 15'),
          step('lower', 'Rumänisches Kreuzheben', 'Hüfte nach hinten, Rücken lang lassen.', '3 x 12'),
          step('upper', 'Brustdrücken am Boden', 'Hanteln kontrolliert nach oben drücken.', '3 x 12'),
          step('upper', 'Rudern mit Hanteln', 'Schulterblätter bewusst zusammenziehen.', '3 x 12'),
          step('upper', 'Seitheben', 'Leichtes Gewicht, ohne Schwung.', '3 x 15'),
          step('lower', 'Glute Bridge', 'Po oben aktiv anspannen.', '3 x 15'),
          step('cardio', 'Hula Hoop Finish', 'Locker, gleichmäßig und mit Spaß abschließen.', '20 Min'),
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
          step('warmup', 'Aufwärmen', 'Marschieren, Arme kreisen, Knie heben, leichte Kniebeugen.', '5-10 Min'),
          step('lower', 'Kniebeugen', 'Optional mit Hanteln, kontrolliert tief gehen.', '3 x 10'),
          step('upper', 'Rudern', 'Rücken gerade, Hanteln zum Körper ziehen.', '3 x 10'),
          step('upper', 'Brustdrücken am Boden', 'Saubere Wiederholungen, Schulterblätter stabil.', '3 x 10'),
          step('upper', 'Schulterdrücken', 'Bauch fest, nicht ins Hohlkreuz fallen.', '3 x 8-10'),
          step('upper', 'Bizeps-Curls', 'Ellbogen ruhig halten, langsam senken.', '2 x 12'),
          step('core', 'Plank', 'Spannung halten und ruhig atmen.', '2 x 30 Sek'),
        ],
      },
      {
        title: 'Mittwoch',
        focus: 'Ganzkörper B',
        tone: 'Variation, Technik und stabiler Rumpf.',
        steps: [
          step('warmup', 'Aufwärmen', 'Locker starten, Gelenke vorbereiten.', '5-10 Min'),
          step('lower', 'Ausfallschritte', 'Pro Bein kontrolliert arbeiten.', '2-3 x 8 je Bein'),
          step('upper', 'Einarmiges Rudern', 'Abstützen, Rücken gerade, sauber ziehen.', '2-3 x 10 je Seite'),
          step('upper', 'Liegestütze', 'Auf Knien möglich, Rumpf bleibt fest.', '2-3 x 8-12'),
          step('upper', 'Seitheben', 'Langsam und ohne Schwung.', '2 x 10-12'),
          step('upper', 'Hammer Curls', 'Kontrolliert curlen und langsam senken.', '2 x 10'),
          step('core', 'Russian Twists', 'Bauch fest, 10 Drehungen pro Seite.', '2 x 20'),
        ],
      },
      {
        title: 'Freitag',
        focus: 'Ganzkörper + Laufband',
        tone: 'Wiederholen, steigern und locker auslaufen.',
        steps: [
          step('warmup', 'Mobilisieren', 'Kurz mobilisieren und warm werden.', '5-10 Min'),
          step('upper', 'Ganzkörper A Runde', 'Montag wiederholen: sauberer oder minimal mehr Wiederholungen.', 'ca. 35 Min'),
          step('cardio', 'Laufband Gehen', '5 Min langsam, danach zügig gehen. Nicht rennen.', '10-15 Min'),
          step('recovery', 'Cooldown', 'Kurz dehnen, Wasser trinken und Puls senken.', '5 Min'),
        ],
      },
    ],
  },
}

function step(type, name, detail, reps) {
  return { type, name, detail, reps }
}

function fmt(seconds) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

export default function App() {
  const [person, setPerson] = useState('connie')
  const [dayIndex, setDayIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState('work')
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(PAUSE_SECONDS)

  const plan = plans[person]
  const day = plan.days[dayIndex]
  const steps = day.steps
  const currentStep = steps[stepIndex] || steps[steps.length - 1]
  const meta = TYPE_META[currentStep.type]
  const TypeIcon = meta.icon

  const completedSteps = phase === 'done' ? steps.length : phase === 'rest' ? stepIndex + 1 : stepIndex
  const progress = Math.min(100, Math.round((completedSteps / steps.length) * 100))
  const phaseLabel = phase === 'done' ? 'Fertig' : phase === 'rest' ? '1 Min Pause' : meta.label

  useEffect(() => {
    setDayIndex(0)
    setStepIndex(0)
    setPhase('work')
    setRunning(false)
    setSeconds(PAUSE_SECONDS)
  }, [person])

  function selectDay(index) {
    setDayIndex(index)
    setStepIndex(0)
    setPhase('work')
    setRunning(false)
    setSeconds(PAUSE_SECONDS)
  }

  function selectStep(index) {
    setStepIndex(index)
    setPhase('work')
    setRunning(false)
    setSeconds(PAUSE_SECONDS)
  }

  function finishPause() {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1)
      setPhase('work')
      setRunning(false)
      setSeconds(PAUSE_SECONDS)
      return
    }

    setPhase('done')
    setRunning(false)
    setSeconds(0)
  }

  function completeExercise() {
    setPhase('rest')
    setSeconds(PAUSE_SECONDS)
    setRunning(true)
  }

  useEffect(() => {
    if (!running || phase !== 'rest') return

    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value > 1) return value - 1
        window.clearInterval(timer)
        window.setTimeout(finishPause, 240)
        return 0
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [running, phase, stepIndex, dayIndex, person])

  function resetWorkout() {
    setStepIndex(0)
    setPhase('work')
    setRunning(false)
    setSeconds(PAUSE_SECONDS)
  }

  function resetPause() {
    setRunning(false)
    setSeconds(PAUSE_SECONDS)
  }

  return (
    <main className={`app ${plan.accent}`}>
      <section className="hero" aria-label="Trainingsübersicht">
        <div className="heroCopy">
          <span className="eyebrow"><Sparkles size={16} /> FitFlow</span>
          <h1>Dein Training, Schritt für Schritt.</h1>
          <p>Übung machen, erledigt tippen, 1 Minute Pause nehmen und weitertrainieren.</p>
          <div className="quickStats" aria-label="Trainingsdaten">
            <span><CalendarDays size={16} /> 3 Tage</span>
            <span><Clock3 size={16} /> 1 Min Pause</span>
            <span><Dumbbell size={16} /> Zuhause</span>
          </div>
        </div>
        <img className="heroImage" src="/assets/hero.png" alt="Helles Home-Workout mit Matte und Hanteln" />
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
                <img src={VISUALS[currentStep.type]} alt={`${currentStep.name} Foto`} />
                <div className="phaseBadge"><TypeIcon size={16} /> {phaseLabel}</div>
              </div>

              <div className="sessionHeader">
                <div>
                  <p className="muted">{day.title} · {day.focus}</p>
                  <h2>{phase === 'rest' ? 'Pause' : currentStep.name}</h2>
                </div>
                <span className="repBadge">{currentStep.reps}</span>
              </div>

              <p className="exerciseText">
                {phase === 'rest'
                  ? 'Atmen, kurz trinken und bereit machen. Danach geht es automatisch weiter.'
                  : currentStep.detail}
              </p>

              {phase === 'rest' && (
                <div className="timerPanel" aria-label="Pausentimer">
                  <TimerReset size={24} />
                  <strong>{fmt(seconds)}</strong>
                </div>
              )}

              <div className="progressLine"><span style={{ width: `${progress}%` }} /></div>

              {phase === 'rest' ? (
                <div className="controls pauseControls">
                  <button className="primaryAction" onClick={() => setRunning(!running)}>
                    {running ? <Pause size={20} /> : <Play size={20} />}
                    {running ? 'Pause' : 'Weiterlaufen'}
                  </button>
                  <button onClick={finishPause}><SkipForward size={20} /> Überspringen</button>
                  <button className="iconAction" onClick={resetPause} aria-label="Pause zurücksetzen"><RotateCcw size={20} /></button>
                </div>
              ) : (
                <div className="controls exerciseControls">
                  <button className="primaryAction" onClick={completeExercise}><CheckCircle2 size={20} /> Erledigt</button>
                  <button onClick={resetWorkout}><RotateCcw size={20} /> Neustart</button>
                </div>
              )}
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
