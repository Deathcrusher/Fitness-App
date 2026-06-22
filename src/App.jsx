import React, { useEffect, useRef, useState } from 'react'
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

const PAUSE_PRESETS = [30, 60, 90]
const WORK_PRESETS = [20, 30, 45, 60, 90]
const STORAGE_KEY = 'fitflow-state-v2'

const VISUALS = {
  warmup: '/assets/warmup.jpg',
  lower: '/assets/lower.jpg',
  upper: '/assets/upper.jpg',
  core: '/assets/core.jpg',
  cardio: '/assets/cardio.jpg',
  recovery: '/assets/recovery.jpg',
}

const EXERCISE_IMG = {
  connie: {
    'Warm-up': 'warmup',
    'Mobilisieren': 'warmup',
    'Kniebeugen': 'kniebeugen',
    'Ausfallschritte': 'ausfallschritte',
    'Rudern mit Hanteln': 'rudern',
    'Schulterdrücken': 'schulterdruecken',
    'Glute Bridge': 'glute-bridge',
    'Plank': 'plank',
    'Cardio Finish': 'hometrainer',
    'Hula Hoop': 'hula-hoop',
    'Hula Hoop Finish': 'hula-hoop',
    'Russian Twists': 'russian-twists',
    'Bicycle Crunches': 'bicycle-crunches',
    'Beinheben': 'beinheben',
    'Ausfahren': 'hometrainer',
    'Brustdrücken am Boden': '/assets/exercises/brustdruecken.jpg',
    'Seitheben': 'seitheben',
  },
  rene: {
    'Aufwärmen': 'warmup',
    'Kniebeugen': 'kniebeugen',
    'Ausfallschritte': 'ausfallschritte',
    'Rudern': 'rudern',
    'Rudern mit Hanteln': 'rudern',
    'Einarmiges Rudern': 'rudern',
    'Brustdrücken am Boden': 'brustdruecken',
    'Schulterdrücken': 'schulterdruecken',
    'Bizeps-Curls': 'bizeps-curls',
    'Plank': 'plank',
    'Liegestütze': 'liegestuetze',
    'Seitheben': 'seitheben',
    'Hammer Curls': 'hammer-curls',
    'Russian Twists': 'russian-twists',
    'Trizepsdrücken': 'trizeps',
    'Laufband Gehen': 'laufband',
    'Cooldown': 'warmup',
  },
}

function imageFor(step, person) {
  const slug = EXERCISE_IMG[person]?.[step.name]
  if (slug?.startsWith('/')) return slug
  return slug ? `/assets/exercises/${person}/${slug}.webp` : VISUALS[step.type]
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
          ...warmupSteps(),
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
          ...warmupSteps(),
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
          ...warmupSteps(),
          step('lower', 'Kniebeugen', 'Sauber, ruhig und kontrolliert arbeiten.', '3 x 15'),
          step('lower', 'Ausfallschritte', 'Pro Bein sauber arbeiten, Oberkörper bleibt ruhig.', '3 x 12 je Bein'),
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
          ...warmupSteps(),
          step('lower', 'Kniebeugen', 'Optional mit Hanteln, kontrolliert tief gehen.', '3 x 10'),
          step('upper', 'Rudern', 'Rücken gerade, Hanteln zum Körper ziehen.', '3 x 10'),
          step('upper', 'Brustdrücken am Boden', 'Saubere Wiederholungen, Schulterblätter stabil.', '3 x 10'),
          step('upper', 'Schulterdrücken', 'Bauch fest, nicht ins Hohlkreuz fallen.', '3 x 8-10'),
          step('upper', 'Bizeps-Curls', 'Ellbogen ruhig halten, langsam senken.', '2 x 12'),
          step('core', 'Plank', 'Spannung halten und ruhig atmen.', '3 x 30-45 Sek'),
        ],
      },
      {
        title: 'Mittwoch',
        focus: 'Ganzkörper B',
        tone: 'Variation, Technik und stabiler Rumpf.',
        steps: [
          ...warmupSteps(),
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
        tone: 'Kraft wiederholen, leicht steigern und locker auslaufen.',
        steps: [
          ...warmupSteps(),
          step('lower', 'Kniebeugen', 'Kontrolliert tief gehen, saubere Technik vor Gewicht.', '3 x 10-12'),
          step('lower', 'Ausfallschritte', 'Pro Bein sauber arbeiten, Oberkörper aufrecht.', '3 x 8 je Bein'),
          step('upper', 'Rudern mit Hanteln', 'Rücken gerade, Schulterblätter zusammenführen.', '3 x 10-12'),
          step('upper', 'Brustdrücken am Boden', 'Saubere Wiederholungen, stabil in den Schultern.', '3 x 10-12'),
          step('upper', 'Schulterdrücken', 'Bauch fest, kontrolliert nach oben drücken.', '3 x 8-10'),
          step('upper', 'Trizepsdrücken', 'Ellbogen nah am Körper, langsam führen.', '2 x 12'),
          step('core', 'Plank', 'Spannung halten, ruhig atmen.', '3 x 30-45 Sek'),
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

function warmupSteps() {
  return [
    step('warmup', 'Marschieren', 'Auf der Stelle marschieren, Arme locker mitnehmen.', '60 Sek'),
    step('warmup', 'Arme kreisen', 'Arme groß und weich kreisen, Schultern entspannt.', '30 Sek'),
    step('warmup', 'Arme kreisen (andere Richtung)', 'Richtung wechseln und gleichmäßig weiterkreisen.', '30 Sek'),
    step('warmup', 'Knie heben – links', 'Linkes Knie Richtung Brust heben, Rumpf stabil halten.', '60 Sek'),
    step('warmup', 'Knie heben – rechts', 'Rechtes Knie Richtung Brust heben.', '60 Sek'),
    step('warmup', 'Ferse zum Po – links', 'Linke Ferse zum Po führen, aufrecht bleiben.', '60 Sek'),
    step('warmup', 'Ferse zum Po – rechts', 'Rechte Ferse zum Po führen.', '60 Sek'),
    step('warmup', 'Leichte Kniebeugen', 'Kontrolliert in die Knie gehen, nicht zu tief.', '30 Sek'),
  ]
}

function timedSeconds(reps) {
  const match = reps.match(/(\d+)\s*Sek/i)
  return match ? Number(match[1]) : null
}

function fmt(seconds) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

let audioCtx = null
function ensureAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()
  } catch {
    /* noop */
  }
}
function tone(freq, dur, when = 0) {
  ensureAudio()
  if (!audioCtx) return
  try {
    const start = audioCtx.currentTime + when
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    osc.start(start)
    osc.stop(start + dur)
  } catch {
    /* noop */
  }
}
function vibrate(pattern) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* noop */
  }
}
function signal(kind) {
  ensureAudio()
  if (kind === 'work-done') {
    vibrate([180])
    tone(880, 0.18)
    tone(660, 0.22, 0.18)
  } else if (kind === 'rest-end') {
    vibrate([120, 60, 120])
    tone(523, 0.15)
    tone(659, 0.15, 0.16)
    tone(784, 0.25, 0.32)
  } else if (kind === 'done') {
    vibrate([140, 80, 140, 80, 220])
    tone(523, 0.15)
    tone(659, 0.15, 0.16)
    tone(784, 0.4, 0.32)
  }
}

export default function App() {
  const saved = loadState()
  const savedPerson = plans[saved.person] ? saved.person : 'connie'
  const savedDayIndex = Math.min(
    Math.max(Number(saved.dayIndex) || 0, 0),
    plans[savedPerson].days.length - 1,
  )
  const savedSteps = plans[savedPerson].days[savedDayIndex].steps
  const savedStepIndex = Math.min(
    Math.max(Number(saved.stepIndex) || 0, 0),
    savedSteps.length - 1,
  )
  const initialStep = savedSteps[savedStepIndex]
  const initialWork = timedSeconds(initialStep.reps)

  const [person, setPerson] = useState(savedPerson)
  const [dayIndex, setDayIndex] = useState(savedDayIndex)
  const [stepIndex, setStepIndex] = useState(savedStepIndex)
  const [phase, setPhase] = useState('work')
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(initialWork != null ? initialWork : 0)
  const [workSeconds, setWorkSeconds] = useState(initialWork != null ? initialWork : 0)
  const [pauseSeconds, setPauseSeconds] = useState(saved.pauseSeconds || 60)

  const wakeLockRef = useRef(null)
  const skipPersonReset = useRef(true)

  const plan = plans[person]
  const day = plan.days[dayIndex]
  const steps = day.steps
  const currentStep = steps[stepIndex] || steps[steps.length - 1]
  const parsedWork = timedSeconds(currentStep.reps)
  const isTimed = parsedWork != null
  const meta = TYPE_META[currentStep.type]
  const TypeIcon = meta.icon

  const completedSteps = phase === 'done' ? steps.length : phase === 'rest' ? stepIndex + 1 : stepIndex
  const progress = Math.min(100, Math.round((completedSteps / steps.length) * 100))
  const phaseLabel = phase === 'done' ? 'Fertig' : phase === 'rest' ? 'Pause' : meta.label
  const showTimer = phase === 'rest' || (phase === 'work' && isTimed)

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ person, dayIndex, stepIndex, pauseSeconds }),
      )
    } catch {
      /* noop */
    }
  }, [person, dayIndex, stepIndex, pauseSeconds])

  function enterWork(nextStepIndex) {
    const target = steps[nextStepIndex]
    const work = timedSeconds(target.reps)
    setStepIndex(nextStepIndex)
    setPhase('work')
    setRunning(false)
    setSeconds(work != null ? work : 0)
    setWorkSeconds(work != null ? work : 0)
  }

  function completeExercise() {
    setPhase('rest')
    setSeconds(pauseSeconds)
    setRunning(true)
  }

  function advanceAfterRest() {
    if (stepIndex < steps.length - 1) {
      enterWork(stepIndex + 1)
    } else {
      setPhase('done')
      setRunning(false)
      setSeconds(0)
      signal('done')
    }
  }

  function selectDay(index) {
    const firstStep = plans[person].days[index].steps[0]
    const work = timedSeconds(firstStep.reps)
    setDayIndex(index)
    setStepIndex(0)
    setPhase('work')
    setRunning(false)
    setSeconds(work != null ? work : 0)
    setWorkSeconds(work != null ? work : 0)
  }

  function selectStep(index) {
    enterWork(index)
  }

  function togglePlay() {
    ensureAudio()
    setRunning((value) => !value)
  }

  function changePause(value) {
    setPauseSeconds(value)
    if (phase === 'rest') setSeconds(value)
  }

  function changeWork(value) {
    setWorkSeconds(value)
    setSeconds(value)
  }

  function resetPause() {
    setRunning(false)
    setSeconds(pauseSeconds)
  }

  function resetWorkout() {
    enterWork(0)
  }

  useEffect(() => {
    if (skipPersonReset.current) {
      skipPersonReset.current = false
      return
    }
    setDayIndex(0)
    setStepIndex(0)
    setPhase('work')
    setRunning(false)
    const firstStep = plans[person].days[0].steps[0]
    const work = timedSeconds(firstStep.reps)
    setSeconds(work != null ? work : 0)
    setWorkSeconds(work != null ? work : 0)
  }, [person])

  useEffect(() => {
    if (!running || phase === 'done') return
    const id = window.setInterval(() => {
      setSeconds((value) => (value > 0 ? value - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, phase])

  useEffect(() => {
    if (seconds !== 0 || !running) return
    const id = window.setTimeout(() => {
      if (phase === 'work' && isTimed) {
        signal('work-done')
        completeExercise()
      } else if (phase === 'rest') {
        signal('rest-end')
        advanceAfterRest()
      }
    }, 200)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running])

  useEffect(() => {
    let active = true
    async function acquire() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch {
        /* noop */
      }
    }
    function release() {
      try {
        wakeLockRef.current?.release()
        wakeLockRef.current = null
      } catch {
        /* noop */
      }
    }
    if (running) acquire()
    else release()
    return () => {
      active = false
      release()
    }
  }, [running])

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible' && running) {
        try {
          if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then((lock) => {
            wakeLockRef.current = lock
          }).catch(() => {})
        } catch {
          /* noop */
        }
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [running])

  return (
    <main className={`app ${plan.accent}`}>
      <section className="hero" aria-label="Trainingsübersicht">
        <div className="heroCopy">
          <span className="eyebrow"><Sparkles size={16} /> FitFlow</span>
          <h1>Dein Training, Schritt für Schritt.</h1>
          <p>Übung machen, erledigt tippen, Pause nehmen und weitertrainieren.</p>
          <div className="quickStats" aria-label="Trainingsdaten">
            <span><CalendarDays size={16} /> 3 Tage</span>
            <span><Clock3 size={16} /> {pauseSeconds}s Pause</span>
            <span><Dumbbell size={16} /> Zuhause</span>
          </div>
        </div>
        <img className="heroImage" src="/assets/hero.jpg" alt="Helles Home-Workout mit Matte und Hanteln" fetchPriority="high" decoding="async" />
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
                <img src={imageFor(currentStep, person)} alt={`${currentStep.name} Foto`} loading="lazy" decoding="async" />
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

              {showTimer && (
                <div className="timerPanel" aria-label={phase === 'rest' ? 'Pausentimer' : 'Halte-Timer'}>
                  <TimerReset size={24} />
                  <strong>{fmt(seconds)}</strong>
                  <span>{phase === 'rest' ? 'Pause' : 'Halten'}</span>
                </div>
              )}

              <div className="progressLine"><span style={{ width: `${progress}%` }} /></div>

              {phase === 'rest' ? (
                <>
                  <div className="controls pauseControls">
                    <button className="primaryAction" onClick={togglePlay}>
                      {running ? <Pause size={20} /> : <Play size={20} />}
                      {running ? 'Pause' : 'Weiterlaufen'}
                    </button>
                    <button onClick={advanceAfterRest}><SkipForward size={20} /> Überspringen</button>
                    <button className="iconAction" onClick={resetPause} aria-label="Pause zurücksetzen"><RotateCcw size={20} /></button>
                  </div>
                  <div className="restPresets" aria-label="Pausenlänge">
                    <span>Pause:</span>
                    {PAUSE_PRESETS.map((preset) => (
                      <button key={preset} className={pauseSeconds === preset ? 'active' : ''} onClick={() => changePause(preset)}>
                        {preset}s
                      </button>
                    ))}
                  </div>
                </>
              ) : isTimed ? (
                <>
                  <div className="controls workControls">
                    <button className="primaryAction" onClick={togglePlay}>
                      {running ? <Pause size={20} /> : <Play size={20} />}
                      {running ? 'Pause' : 'Timer starten'}
                    </button>
                    <button className="doneAction" onClick={completeExercise}><CheckCircle2 size={20} /> Erledigt</button>
                    <button className="iconAction" onClick={resetWorkout} aria-label="Neustart"><RotateCcw size={20} /></button>
                  </div>
                  <div className="restPresets" aria-label="Übungs-Dauer">
                    <span>Dauer:</span>
                    {WORK_PRESETS.map((preset) => (
                      <button key={preset} className={workSeconds === preset ? 'active' : ''} onClick={() => changeWork(preset)}>
                        {preset}s
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="controls exerciseControls">
                  <button className="doneAction" onClick={completeExercise}><CheckCircle2 size={20} /> Erledigt</button>
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
