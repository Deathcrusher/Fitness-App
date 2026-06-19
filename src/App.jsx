import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Dumbbell, HeartPulse, Pause, Play, RotateCcw, SkipForward, Timer, Trophy } from 'lucide-react'

const plans = {
  connie: {
    name: "Connie's Programm",
    goal: 'Abnehmen, straffen & wohlfühlen',
    theme: 'pink',
    days: [
      { title: 'Montag – Ganzkörper + Cardio', focus: 'Straffen & Kalorien verbrennen', steps: [
        ['Warm-up', 'Locker starten: marschieren, Arme kreisen, Knie heben, Fersen zum Po.', 480, 0, '5–10 Min'],
        ['Kniebeugen', 'Brust aufrecht, Knie leicht nach außen, ruhig atmen.', 45, 50, '3 × 15'],
        ['Ausfallschritte', 'Kontrolliert runter, pro Bein sauber arbeiten.', 45, 50, '3 × 12 je Bein'],
        ['Rudern mit Hanteln', 'Rücken gerade, Ellbogen eng am Körper ziehen.', 45, 50, '3 × 12'],
        ['Schulterdrücken', 'Hanteln kontrolliert hochdrücken, Bauch fest.', 45, 50, '3 × 12'],
        ['Glute Bridge', 'Po oben kurz anspannen, langsam absenken.', 45, 50, '3 × 15'],
        ['Plank', 'Rücken gerade, Bauch fest, nicht durchhängen.', 40, 30, '3 × 30–45 Sek'],
        ['Cardio Finish', 'Hometrainer locker, Puls moderat, sprechen möglich.', 1200, 0, '20 Min']
      ]},
      { title: 'Mittwoch – Cardio & Core', focus: 'Bauch & Ausdauer', steps: [
        ['Warm-up', 'Gelenke vorbereiten und locker bewegen.', 420, 0, '5–10 Min'],
        ['Hula Hoop', 'Gleichmäßiges Tempo, Spaß haben und dranbleiben.', 1800, 60, '30 Min'],
        ['Plank', 'Bauch fest, ruhig halten.', 40, 30, '3 × 30–45 Sek'],
        ['Russian Twists', 'Oberkörper drehen, Core bleibt aktiv.', 45, 30, '3 × 20'],
        ['Bicycle Crunches', 'Langsam und sauber, nicht am Nacken ziehen.', 45, 30, '3 × 20'],
        ['Beinheben', 'Rücken bleibt am Boden.', 45, 30, '3 × 15'],
        ['Cardio Finish', 'Hometrainer locker ausfahren.', 900, 0, '15 Min']
      ]},
      { title: 'Freitag – Ganzkörper + Cardio', focus: 'Po, Beine & Oberkörper', steps: [
        ['Warm-up', 'Locker starten und Atmung finden.', 480, 0, '5–10 Min'],
        ['Kniebeugen', 'Sauber und kontrolliert.', 45, 50, '3 × 15'],
        ['Rumänisches Kreuzheben', 'Hüfte nach hinten, Rücken gerade.', 45, 50, '3 × 12'],
        ['Brustdrücken am Boden', 'Hanteln kontrolliert nach oben drücken.', 45, 50, '3 × 12'],
        ['Rudern mit Hanteln', 'Schulterblätter zusammenziehen.', 45, 50, '3 × 12'],
        ['Seitheben', 'Leichtes Gewicht, kein Schwung.', 45, 50, '3 × 15'],
        ['Glute Bridge', 'Po oben aktiv anspannen.', 45, 50, '3 × 15'],
        ['Hula Hoop Finish', 'Locker, spaßig, Kalorien verbrennen.', 1200, 0, '20 Min']
      ]}
    ]
  },
  rene: {
    name: "René's Programm",
    goal: 'Kraft, Muskeln & Ausdauer',
    theme: 'green',
    days: [
      { title: 'Montag – Ganzkörper A', focus: 'Basis-Kraft', steps: [
        ['Aufwärmprogramm', 'Marschieren, Arme kreisen, Knie heben, leichte Kniebeugen.', 480, 0, '5–10 Min'],
        ['Kniebeugen', 'Optional mit Hanteln, kontrolliert tief gehen.', 45, 75, '3 × 10'],
        ['Rudern', 'Rücken gerade, Hanteln zum Körper ziehen.', 45, 75, '3 × 10'],
        ['Brustdrücken am Boden', 'Saubere Wiederholungen, Schulterblätter stabil.', 45, 75, '3 × 10'],
        ['Schulterdrücken', 'Bauch fest, nicht ins Hohlkreuz.', 45, 75, '3 × 8–10'],
        ['Bizeps-Curls', 'Ellbogen ruhig halten.', 40, 60, '2 × 12'],
        ['Plank', 'Spannung halten, ruhig atmen.', 30, 45, '2 × 30 Sek']
      ]},
      { title: 'Mittwoch – Ganzkörper B', focus: 'Variation & Technik', steps: [
        ['Aufwärmprogramm', 'Locker starten, Gelenke vorbereiten.', 480, 0, '5–10 Min'],
        ['Ausfallschritte', 'Pro Bein kontrolliert arbeiten.', 45, 75, '2–3 × 8 je Bein'],
        ['Einarmiges Rudern', 'Abstützen, Rücken gerade.', 45, 75, '2–3 × 10 je Seite'],
        ['Liegestütze', 'Auf Knien möglich, sauber ausführen.', 45, 75, '2–3 × 8–12'],
        ['Seitheben', 'Langsam und ohne Schwung.', 40, 60, '2 × 10–12'],
        ['Hammer Curls', 'Kontrolliert curlen.', 40, 60, '2 × 10'],
        ['Russian Twists', '10 pro Seite, Bauch fest.', 45, 45, '2 × 20']
      ]},
      { title: 'Freitag – Ganzkörper A + Laufband', focus: 'Wiederholen & steigern', steps: [
        ['Aufwärmprogramm', 'Kurz mobilisieren und warm werden.', 420, 0, '5–10 Min'],
        ['Ganzkörper A Runde', 'Montag wiederholen: etwas sauberer oder minimal mehr Wiederholungen.', 2100, 60, 'ca. 35 Min'],
        ['Laufband Gehen', '5 Min langsam, danach 5–10 Min zügig. Nicht rennen.', 900, 0, '10–15 Min']
      ]}
    ]
  }
}

function toStep(data) { return { name: data[0], detail: data[1], work: data[2], rest: data[3], reps: data[4] } }
function fmt(s) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${String(sec).padStart(2, '0')}` }

export default function App() {
  const [person, setPerson] = useState('connie')
  const [dayIndex, setDayIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState('work')
  const [running, setRunning] = useState(false)

  const plan = plans[person]
  const day = plan.days[dayIndex]
  const steps = day.steps.map(toStep)
  const step = steps[stepIndex]
  const [seconds, setSeconds] = useState(step.work)

  useEffect(() => { setDayIndex(0); setStepIndex(0); setPhase('work'); setRunning(false) }, [person])
  useEffect(() => { setSeconds(phase === 'rest' ? step.rest : step.work) }, [person, dayIndex, stepIndex, phase])

  const progress = Math.round((stepIndex / steps.length) * 100)
  const phaseLabel = phase === 'rest' ? 'Pause' : 'Übung'

  function next() {
    if (phase === 'work' && step.rest > 0) { setPhase('rest'); setRunning(true); return }
    if (stepIndex < steps.length - 1) { setStepIndex(stepIndex + 1); setPhase('work'); setRunning(false); return }
    setPhase('done'); setRunning(false)
  }

  useEffect(() => {
    if (!running || phase === 'done') return
    const timer = setInterval(() => {
      setSeconds(v => {
        if (v > 1) return v - 1
        clearInterval(timer)
        setTimeout(next, 250)
        return 0
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running, phase, stepIndex, dayIndex, person])

  function resetWorkout() { setStepIndex(0); setPhase('work'); setRunning(false) }
  function resetTimer() { setRunning(false); setPhase('work'); setSeconds(step.work) }

  return <main className={`app ${plan.theme}`}>
    <section className="hero">
      <div>
        <p className="kicker">Fitness App</p>
        <h1>Trainieren wie mit Thermomix-Steps</h1>
        <p>Programm wählen, Übung starten, Pause automatisch laufen lassen, weiterziehen.</p>
      </div>
      <div className="heroBadge"><HeartPulse size={34}/><span>3 Tage Plan</span></div>
    </section>

    <section className="chooser">
      {Object.entries(plans).map(([key, p]) => <button key={key} className={person === key ? 'selected' : ''} onClick={() => setPerson(key)}>
        <div className="avatar">{key === 'connie' ? 'C' : 'R'}</div>
        <div><strong>{p.name}</strong><small>{p.goal}</small></div>
      </button>)}
    </section>

    <section className="dayTabs">
      {plan.days.map((d, i) => <button key={d.title} className={i === dayIndex ? 'active' : ''} onClick={() => { setDayIndex(i); setStepIndex(0); setPhase('work'); setRunning(false) }}>
        <span>{d.title.split(' – ')[0]}</span><b>{d.focus}</b>
      </button>)}
    </section>

    <section className="grid">
      <aside className="panel list">
        <h2>{day.title}</h2>
        <p>{day.focus}</p>
        {steps.map((s, i) => <button key={s.name} className={i === stepIndex ? 'current' : i < stepIndex ? 'done' : ''} onClick={() => { setStepIndex(i); setPhase('work'); setRunning(false) }}>
          <span>{i < stepIndex ? <CheckCircle2 size={18}/> : i + 1}</span>
          <div><strong>{s.name}</strong><small>{s.reps}</small></div>
        </button>)}
      </aside>

      <section className="panel workout">
        {phase === 'done' ? <div className="finish">
          <Trophy size={80}/><h2>Training geschafft!</h2><p>Stark durchgezogen. Wasser trinken, kurz bewegen und stolz sein.</p>
          <button onClick={resetWorkout}><RotateCcw/> Nochmal starten</button>
        </div> : <>
          <div className="topline"><span>{phaseLabel}</span><b>{progress}%</b></div>
          <div className="bar"><i style={{width: `${progress}%`}} /></div>
          <div className="exerciseIcon"><Dumbbell size={70}/></div>
          <h2>{step.name}</h2>
          <p className="reps">{step.reps}</p>
          <p className="detail">{step.detail}</p>
          <div className="timer"><Timer/><strong>{fmt(seconds)}</strong></div>
          <div className="controls">
            <button className="primary" onClick={() => setRunning(!running)}>{running ? <Pause/> : <Play/>}{running ? 'Pause' : 'Start'}</button>
            <button onClick={next}><SkipForward/> {phase === 'rest' ? 'Weiter' : 'Erledigt'}</button>
            <button onClick={resetTimer}><RotateCcw/> Reset</button>
          </div>
          <p className="hint">{phase === 'rest' ? 'Atmen, kurz trinken, gleich geht es weiter.' : step.rest > 0 ? `Danach startet automatisch ${step.rest} Sekunden Pause.` : 'Diese Übung hat keine Pause danach.'}</p>
        </>}
      </section>
    </section>
  </main>
}
